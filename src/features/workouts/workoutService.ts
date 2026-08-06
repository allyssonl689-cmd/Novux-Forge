import { supabase } from '@/lib/supabase';
import { Workout, WorkoutExercise } from '@/types/workout';

/** Ficha com a contagem de exercícios — usado na listagem */
export interface WorkoutSummary extends Workout {
  exercise_count: number;
}

/** Exercício da ficha já com os dados do catálogo achatados */
export interface WorkoutExerciseDetailed extends WorkoutExercise {
  exercise_name: string;
  exercise_slug: string;
  muscle_group: string;
  equipment: string;
  free_db_id: string | null;
  rapid_api_id: string | null;
}

export interface WorkoutWithExercises {
  workout: Workout;
  exercises: WorkoutExerciseDetailed[];
}

export interface NewWorkoutExercise {
  exercise_id: string;
  sort_order?: number;
  default_sets?: number;
  default_reps?: number;
  default_weight_kg?: number | null;
  rest_seconds?: number;
  notes?: string | null;
}

export const DEFAULT_SETS = 3;
export const DEFAULT_REPS = 10;
export const DEFAULT_REST_SECONDS = 90;

// ── Leitura ──────────────────────────────────────────────────────────────────

export async function fetchWorkouts(): Promise<WorkoutSummary[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*, workout_exercises(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((w: any) => ({
    ...w,
    exercise_count: w.workout_exercises?.[0]?.count ?? 0,
  })) as WorkoutSummary[];
}

export async function fetchWorkoutWithExercises(
  workoutId: string,
): Promise<WorkoutWithExercises> {
  const { data: workout, error: wErr } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();

  if (wErr) throw wErr;

  const { data: exercises, error: eErr } = await supabase
    .from('workout_exercises')
    .select('*, exercises(name, slug, muscle_group, equipment, free_db_id, rapid_api_id)')
    .eq('workout_id', workoutId)
    .order('sort_order', { ascending: true });

  if (eErr) throw eErr;

  return {
    workout: workout as Workout,
    exercises: (exercises ?? []).map((we: any) => ({
      ...we,
      exercise_name: we.exercises?.name ?? '',
      exercise_slug: we.exercises?.slug ?? '',
      muscle_group: we.exercises?.muscle_group ?? '',
      equipment: we.exercises?.equipment ?? '',
      free_db_id: we.exercises?.free_db_id ?? null,
      rapid_api_id: we.exercises?.rapid_api_id ?? null,
    })) as WorkoutExerciseDetailed[],
  };
}

// ── Escrita: fichas ──────────────────────────────────────────────────────────

/**
 * Cria uma ficha. Aceita exercícios já na criação — é o caminho usado tanto pelo
 * editor manual quanto pela futura clonagem de templates prontos.
 */
export async function createWorkout(params: {
  name: string;
  description?: string | null;
  category?: string | null;
  /** Dia do plano oficial que originou esta ficha, quando clonada */
  sourceSplitDayId?: string | null;
  exercises?: NewWorkoutExercise[];
}): Promise<Workout> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  // Nova ficha entra no fim da lista
  const { count } = await supabase
    .from('workouts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      name: params.name.trim(),
      description: params.description ?? null,
      category: params.category ?? null,
      source_split_day_id: params.sourceSplitDayId ?? null,
      sort_order: count ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;

  const workout = data as Workout;

  if (params.exercises?.length) {
    await addExercisesToWorkout(workout.id, params.exercises);
  }

  return workout;
}

export async function updateWorkout(
  workoutId: string,
  patch: Partial<Pick<Workout, 'name' | 'description' | 'category' | 'sort_order'>>,
): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', workoutId);

  if (error) throw error;
}

/**
 * Remove a ficha. O histórico é preservado: `workout_logs.workout_id` tem
 * `on delete set null` e o nome já foi gravado como snapshot no log.
 */
export async function deleteWorkout(workoutId: string): Promise<void> {
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
  if (error) throw error;
}

// ── Escrita: exercícios da ficha ─────────────────────────────────────────────

export async function addExercisesToWorkout(
  workoutId: string,
  exercises: NewWorkoutExercise[],
): Promise<void> {
  if (exercises.length === 0) return;

  // Continua a numeração a partir do que já existe na ficha
  const { count } = await supabase
    .from('workout_exercises')
    .select('id', { count: 'exact', head: true })
    .eq('workout_id', workoutId);

  const base = count ?? 0;

  const rows = exercises.map((ex, i) => ({
    workout_id: workoutId,
    exercise_id: ex.exercise_id,
    sort_order: ex.sort_order ?? base + i,
    default_sets: ex.default_sets ?? DEFAULT_SETS,
    default_reps: ex.default_reps ?? DEFAULT_REPS,
    default_weight_kg: ex.default_weight_kg ?? null,
    rest_seconds: ex.rest_seconds ?? DEFAULT_REST_SECONDS,
    notes: ex.notes ?? null,
  }));

  const { error } = await supabase.from('workout_exercises').insert(rows);
  if (error) throw error;
}

export async function updateWorkoutExercise(
  workoutExerciseId: string,
  patch: Partial<
    Pick<
      WorkoutExercise,
      | 'default_sets'
      | 'default_reps'
      | 'default_weight_kg'
      | 'rest_seconds'
      | 'notes'
      | 'sort_order'
      | 'superset_group'
      | 'exercise_id'
    >
  >,
): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .update(patch)
    .eq('id', workoutExerciseId);

  if (error) throw error;
}

export async function removeWorkoutExercise(workoutExerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', workoutExerciseId);

  if (error) throw error;
}

/** Grava a nova ordem após mover um exercício para cima/baixo */
export async function reorderWorkoutExercises(
  ordered: { id: string; sort_order: number }[],
): Promise<void> {
  await Promise.all(
    ordered.map(({ id, sort_order }) =>
      supabase.from('workout_exercises').update({ sort_order }).eq('id', id),
    ),
  );
}
