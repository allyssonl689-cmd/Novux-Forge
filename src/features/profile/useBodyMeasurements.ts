import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PROFILE_KEY } from './useProfile';
import {
  deleteBodyMeasurement,
  fetchBodyMeasurements,
  getProgressPhotoUrl,
  logBodyMeasurement,
  removeProgressPhoto,
  uploadProgressPhoto,
} from './bodyMeasurementsService';
import { BodyMeasurement } from '@/types/workout';

export const BODY_MEASUREMENTS_KEY = ['body-measurements'] as const;

export function useBodyMeasurements() {
  return useQuery({
    queryKey: BODY_MEASUREMENTS_KEY,
    queryFn: () => fetchBodyMeasurements(),
  });
}

export function useLogBodyMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ weightKg, measuredAt }: { weightKg: number; measuredAt?: string }) =>
      logBodyMeasurement(weightKg, measuredAt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useDeleteBodyMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (measurement: BodyMeasurement) => deleteBodyMeasurement(measurement),
    onSuccess: () => qc.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY }),
  });
}

export function useUploadProgressPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ measurementId, localUri }: { measurementId: string; localUri: string }) =>
      uploadProgressPhoto(measurementId, localUri),
    onSuccess: () => qc.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY }),
  });
}

export function useRemoveProgressPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ measurementId, path }: { measurementId: string; path: string }) =>
      removeProgressPhoto(measurementId, path),
    onSuccess: () => qc.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY }),
  });
}

/** URL assinada (bucket privado) — cacheia perto do tempo de expiração do link (1h) */
export function useProgressPhotoUrl(path: string | null) {
  return useQuery({
    queryKey: ['progress-photo-url', path],
    queryFn: () => getProgressPhotoUrl(path as string),
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
  });
}
