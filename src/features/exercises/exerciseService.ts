import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/workout';

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Exercise[];
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Exercise;
}

export interface ExerciseAlternative {
  id: string;
  name: string;
  equipment: string;
  difficulty: string;
  /** true quando o equipamento é diferente do exercício original */
  differentEquipment: boolean;
}

/**
 * Alternativas para "o aparelho está ocupado" ou "não tenho esse equipamento".
 * Busca o mesmo grupo muscular e prioriza equipamento diferente — se você não
 * tem a máquina, um exercício com a mesma máquina não resolve.
 */
export async function fetchExerciseAlternatives(
  exercise: Pick<Exercise, 'id' | 'muscle_group' | 'equipment' | 'category'>,
  limit = 4,
): Promise<ExerciseAlternative[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name, equipment, difficulty, category')
    .eq('muscle_group', exercise.muscle_group)
    .neq('id', exercise.id)
    .eq('is_public', true);

  if (error) throw error;

  const rows = (data ?? []) as {
    id: string;
    name: string;
    equipment: string;
    difficulty: string;
    category: string;
  }[];

  const DIFFICULTY_ORDER: Record<string, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };

  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      equipment: r.equipment,
      difficulty: r.difficulty,
      differentEquipment: r.equipment !== exercise.equipment,
      sameCategory: r.category === exercise.category,
    }))
    .sort((a, b) => {
      // 1) equipamento diferente primeiro  2) mesmo padrão de movimento
      // 3) mais fácil primeiro
      if (a.differentEquipment !== b.differentEquipment) return a.differentEquipment ? -1 : 1;
      if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
      return (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1);
    })
    .slice(0, limit)
    .map(({ sameCategory, ...rest }) => rest);
}
