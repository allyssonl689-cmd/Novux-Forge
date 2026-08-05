import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addExercisesToWorkout,
  createWorkout,
  deleteWorkout,
  fetchWorkoutWithExercises,
  fetchWorkouts,
  NewWorkoutExercise,
  removeWorkoutExercise,
  reorderWorkoutExercises,
  updateWorkout,
  updateWorkoutExercise,
} from './workoutService';
import { Workout, WorkoutExercise } from '@/types/workout';

export const WORKOUTS_KEY = ['workouts'] as const;

export function useWorkouts() {
  return useQuery({
    queryKey: WORKOUTS_KEY,
    queryFn: fetchWorkouts,
  });
}

export function useWorkoutWithExercises(workoutId: string | null) {
  return useQuery({
    queryKey: [...WORKOUTS_KEY, workoutId],
    queryFn: () => fetchWorkoutWithExercises(workoutId!),
    enabled: !!workoutId,
  });
}

/** Invalida a lista e, opcionalmente, a ficha específica */
function useInvalidateWorkouts() {
  const qc = useQueryClient();
  return (workoutId?: string) => {
    qc.invalidateQueries({ queryKey: WORKOUTS_KEY });
    if (workoutId) qc.invalidateQueries({ queryKey: [...WORKOUTS_KEY, workoutId] });
  };
}

export function useCreateWorkout() {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => invalidate(),
  });
}

export function useUpdateWorkout(workoutId: string) {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: (patch: Partial<Pick<Workout, 'name' | 'description' | 'category' | 'sort_order'>>) =>
      updateWorkout(workoutId, patch),
    onSuccess: () => invalidate(workoutId),
  });
}

export function useDeleteWorkout() {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => invalidate(),
  });
}

export function useAddExercisesToWorkout(workoutId: string) {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: (exercises: NewWorkoutExercise[]) => addExercisesToWorkout(workoutId, exercises),
    onSuccess: () => invalidate(workoutId),
  });
}

export function useUpdateWorkoutExercise(workoutId: string) {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<
        Pick<
          WorkoutExercise,
          'default_sets' | 'default_reps' | 'default_weight_kg' | 'rest_seconds' | 'notes' | 'sort_order'
        >
      >;
    }) => updateWorkoutExercise(id, patch),
    onSuccess: () => invalidate(workoutId),
  });
}

export function useRemoveWorkoutExercise(workoutId: string) {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: removeWorkoutExercise,
    onSuccess: () => invalidate(workoutId),
  });
}

export function useReorderWorkoutExercises(workoutId: string) {
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: reorderWorkoutExercises,
    onSuccess: () => invalidate(workoutId),
  });
}
