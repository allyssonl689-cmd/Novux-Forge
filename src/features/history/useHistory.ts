import { useQuery } from '@tanstack/react-query';
import { fetchWorkoutHistory, fetchWorkoutLogDetail } from './historyService';

export const HISTORY_KEY = ['history'] as const;

export function useHistory() {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: fetchWorkoutHistory,
  });
}

export function useWorkoutLogDetail(id: string | null) {
  return useQuery({
    queryKey: [...HISTORY_KEY, id],
    queryFn: () => fetchWorkoutLogDetail(id!),
    enabled: !!id,
  });
}
