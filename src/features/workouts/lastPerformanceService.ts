import { supabase } from '@/lib/supabase';
import { LastPerformance } from './progression';

export interface LastPerformanceEntry extends LastPerformance {
  completedAt: string;
}

/**
 * Última execução registrada de cada exercício: a série de trabalho (não
 * aquecimento) mais recente. Usada para mostrar "última vez" e sugerir a
 * carga inicial. O RLS de set_logs já restringe ao próprio usuário.
 */
export async function fetchLastPerformance(
  exerciseIds: string[],
): Promise<Record<string, LastPerformanceEntry>> {
  if (exerciseIds.length === 0) return {};

  const { data, error } = await supabase
    .from('set_logs')
    .select('weight_kg, reps, completed_at, exercise_logs!inner(exercise_id)')
    .in('exercise_logs.exercise_id', exerciseIds)
    .eq('is_warmup', false)
    .not('weight_kg', 'is', null)
    .order('completed_at', { ascending: false });

  if (error) return {};

  const map: Record<string, LastPerformanceEntry> = {};
  for (const row of (data ?? []) as any[]) {
    const exId = row.exercise_logs?.exercise_id;
    // Ordenado por data desc → a primeira ocorrência de cada exercício é a mais recente
    if (!exId || map[exId]) continue;
    map[exId] = {
      weightKg: row.weight_kg,
      reps: row.reps,
      completedAt: row.completed_at,
    };
  }
  return map;
}
