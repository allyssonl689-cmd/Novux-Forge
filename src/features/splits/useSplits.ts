import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WORKOUTS_KEY } from '@/features/workouts/useWorkouts';
import {
  applySplit,
  fetchAppliedSplitDayIds,
  fetchSplitDetail,
  fetchSplits,
  SplitDetail,
} from './splitService';

export const SPLITS_KEY = ['splits'] as const;
export const APPLIED_DAYS_KEY = ['splits', 'applied-days'] as const;

export function useSplits() {
  return useQuery({
    queryKey: SPLITS_KEY,
    queryFn: fetchSplits,
    staleTime: 10 * 60 * 1000, // catálogo oficial muda raramente
  });
}

export function useSplitDetail(splitId: string | null) {
  return useQuery({
    queryKey: [...SPLITS_KEY, splitId],
    queryFn: () => fetchSplitDetail(splitId!),
    enabled: !!splitId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAppliedSplitDays() {
  return useQuery({
    queryKey: APPLIED_DAYS_KEY,
    queryFn: fetchAppliedSplitDayIds,
  });
}

export function useApplySplit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (split: SplitDetail) => applySplit(split),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKOUTS_KEY });
      qc.invalidateQueries({ queryKey: APPLIED_DAYS_KEY });
    },
  });
}
