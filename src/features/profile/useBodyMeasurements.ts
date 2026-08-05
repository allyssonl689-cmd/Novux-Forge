import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PROFILE_KEY } from './useProfile';
import {
  deleteBodyMeasurement,
  fetchBodyMeasurements,
  logBodyMeasurement,
} from './bodyMeasurementsService';

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
    mutationFn: (id: string) => deleteBodyMeasurement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BODY_MEASUREMENTS_KEY }),
  });
}
