import { useQuery } from '@tanstack/react-query';
import { fetchExerciseAlternatives, fetchExerciseById, fetchExercises } from './exerciseService';
import { Exercise } from '@/types/workout';

export const EXERCISES_KEY = ['exercises'] as const;

export function useExercises() {
  return useQuery({
    queryKey: EXERCISES_KEY,
    queryFn: fetchExercises,
    staleTime: 5 * 60 * 1000, // 5 min — catálogo muda pouco
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: [...EXERCISES_KEY, id],
    queryFn: () => fetchExerciseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExerciseAlternatives(exercise: Exercise | undefined) {
  return useQuery({
    queryKey: [...EXERCISES_KEY, exercise?.id, 'alternatives'],
    queryFn: () => fetchExerciseAlternatives(exercise!),
    enabled: !!exercise,
    staleTime: 5 * 60 * 1000,
  });
}
