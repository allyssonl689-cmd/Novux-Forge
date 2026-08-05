import { supabase } from '@/lib/supabase';
import { createWorkout } from '@/features/workouts/workoutService';
import { Workout } from '@/types/workout';

export type SplitGoal = 'hipertrofia' | 'forca' | 'emagrecimento' | 'condicionamento';
export type SplitLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentProfile = 'gym' | 'dumbbells' | 'home';

export interface TrainingSplit {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  goal: SplitGoal;
  level: SplitLevel;
  days_per_week: number;
  equipment_profile: EquipmentProfile;
  sort_order: number;
}

export interface SplitDayExercise {
  id: string;
  exercise_id: string;
  sort_order: number;
  sets: number;
  reps: number;
  rep_range: string | null;
  rest_seconds: number;
  is_time_based: boolean;
  notes: string | null;
  exercise_name: string;
  exercise_slug: string;
  muscle_group: string;
  equipment: string;
}

export interface SplitDay {
  id: string;
  day_index: number;
  label: string;
  name: string;
  focus: string[];
  exercises: SplitDayExercise[];
}

export interface SplitDetail extends TrainingSplit {
  days: SplitDay[];
}

export const LEVEL_LABEL: Record<SplitLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const GOAL_LABEL: Record<SplitGoal, string> = {
  hipertrofia: 'Hipertrofia',
  forca: 'Força',
  emagrecimento: 'Emagrecimento',
  condicionamento: 'Condicionamento',
};

export const EQUIPMENT_LABEL: Record<EquipmentProfile, string> = {
  gym: 'Academia',
  dumbbells: 'Halteres',
  home: 'Em casa',
};

export async function fetchSplits(): Promise<TrainingSplit[]> {
  const { data, error } = await supabase
    .from('training_splits')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrainingSplit[];
}

export async function fetchSplitDetail(splitId: string): Promise<SplitDetail> {
  const { data, error } = await supabase
    .from('training_splits')
    .select(
      '*, split_days(*, split_day_exercises(*, exercises(name, slug, muscle_group, equipment)))',
    )
    .eq('id', splitId)
    .single();

  if (error) throw error;

  const raw = data as any;

  // Ordenação feita no cliente: evita depender da sintaxe de order em
  // tabelas relacionadas, que mudou entre versões do PostgREST
  const days: SplitDay[] = (raw.split_days ?? [])
    .slice()
    .sort((a: any, b: any) => a.day_index - b.day_index)
    .map((d: any) => ({
      id: d.id,
      day_index: d.day_index,
      label: d.label,
      name: d.name,
      focus: d.focus ?? [],
      exercises: (d.split_day_exercises ?? [])
        .slice()
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((e: any) => ({
          id: e.id,
          exercise_id: e.exercise_id,
          sort_order: e.sort_order,
          sets: e.sets,
          reps: e.reps,
          rep_range: e.rep_range,
          rest_seconds: e.rest_seconds,
          is_time_based: e.is_time_based,
          notes: e.notes,
          exercise_name: e.exercises?.name ?? '',
          exercise_slug: e.exercises?.slug ?? '',
          muscle_group: e.exercises?.muscle_group ?? '',
          equipment: e.exercises?.equipment ?? '',
        })),
    }));

  return { ...(raw as TrainingSplit), days };
}

/**
 * Clona o plano para as fichas do usuário — uma ficha por dia da divisão.
 * As fichas são independentes a partir daqui: editar ou apagar não afeta o
 * catálogo oficial nem o plano de origem.
 */
export async function applySplit(split: SplitDetail): Promise<Workout[]> {
  const created: Workout[] = [];

  // Sequencial de propósito: mantém a ordem A, B, C… no sort_order das fichas
  for (const day of split.days) {
    const workout = await createWorkout({
      name: `${day.label} — ${day.name}`,
      description: `Criada a partir do plano ${split.name}`,
      category: split.name,
      sourceSplitDayId: day.id,
      exercises: day.exercises.map((ex, i) => ({
        exercise_id: ex.exercise_id,
        sort_order: i,
        default_sets: ex.sets,
        default_reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.rep_range
          ? `Faixa alvo: ${ex.rep_range}${ex.is_time_based ? '' : ' repetições'}`
          : null,
      })),
    });
    created.push(workout);
  }

  return created;
}

/** Dias já clonados pelo usuário — evita aplicar o mesmo plano duas vezes sem avisar */
export async function fetchAppliedSplitDayIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('source_split_day_id')
    .eq('is_active', true)
    .not('source_split_day_id', 'is', null);

  if (error) throw error;
  return (data ?? []).map((w: any) => w.source_split_day_id as string);
}
