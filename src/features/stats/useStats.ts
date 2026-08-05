import { useQuery } from '@tanstack/react-query';
import { fetchTrainingStats } from './statsService';

export const STATS_KEY = ['training-stats'] as const;

export function useTrainingStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: fetchTrainingStats,
    staleTime: 60 * 1000,
  });
}
