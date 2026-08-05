import { supabase } from '@/lib/supabase';

export interface WorkoutLogSummary {
  id: string;
  /** null quando a ficha de origem foi excluída */
  workout_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  duration_secs: number | null;
  total_volume_kg: number;
  notes: string | null;
  exercise_count: number;
}

export interface WorkoutLogDetail {
  id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  duration_secs: number | null;
  total_volume_kg: number;
  notes: string | null;
  exercise_logs: {
    id: string;
    exercise_name: string;
    sort_order: number;
    set_logs: {
      id: string;
      set_number: number;
      weight_kg: number | null;
      reps: number | null;
      duration_secs: number | null;
      is_warmup: boolean;
      is_personal_record: boolean;
    }[];
  }[];
}

export async function fetchWorkoutHistory(): Promise<WorkoutLogSummary[]> {
  // Busca logs finalizados — sem select aninhado para evitar conflito de RLS
  const { data: logs, error: logsErr } = await supabase
    .from('workout_logs')
    .select('id, workout_id, name, started_at, finished_at, duration_secs, total_volume_kg, notes')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false });

  if (logsErr) throw logsErr;
  if (!logs || logs.length === 0) return [];

  // Conta exercícios de cada log numa query separada para evitar join circular no RLS
  const logIds = logs.map((l: any) => l.id);
  const { data: exCounts, error: exErr } = await supabase
    .from('exercise_logs')
    .select('workout_log_id')
    .in('workout_log_id', logIds);

  if (exErr) throw exErr;

  // Agrupa contagem por workout_log_id
  const countMap: Record<string, number> = {};
  for (const row of exCounts ?? []) {
    countMap[row.workout_log_id] = (countMap[row.workout_log_id] ?? 0) + 1;
  }

  return logs.map((log: any) => ({
    ...log,
    exercise_count: countMap[log.id] ?? 0,
  }));
}

export async function fetchWorkoutLogDetail(id: string): Promise<WorkoutLogDetail> {
  // Busca o workout_log
  const { data: log, error: logErr } = await supabase
    .from('workout_logs')
    .select('id, name, started_at, finished_at, duration_secs, total_volume_kg, notes')
    .eq('id', id)
    .single();

  if (logErr) throw logErr;

  // Busca exercise_logs separadamente
  const { data: exerciseLogs, error: elErr } = await supabase
    .from('exercise_logs')
    .select('id, exercise_name, sort_order')
    .eq('workout_log_id', id)
    .order('sort_order', { ascending: true });

  if (elErr) throw elErr;
  if (!exerciseLogs || exerciseLogs.length === 0) {
    return { ...(log as any), exercise_logs: [] };
  }

  // Busca set_logs de todos os exercise_logs de uma vez
  const exLogIds = exerciseLogs.map((el: any) => el.id);
  const { data: setLogs, error: slErr } = await supabase
    .from('set_logs')
    .select('id, exercise_log_id, set_number, weight_kg, reps, duration_secs, is_warmup, is_personal_record')
    .in('exercise_log_id', exLogIds)
    .order('set_number', { ascending: true });

  if (slErr) throw slErr;

  // Agrupa set_logs por exercise_log_id
  const setsMap: Record<string, any[]> = {};
  for (const s of setLogs ?? []) {
    if (!setsMap[s.exercise_log_id]) setsMap[s.exercise_log_id] = [];
    setsMap[s.exercise_log_id].push(s);
  }

  const exercise_logs = exerciseLogs.map((el: any) => ({
    ...el,
    set_logs: setsMap[el.id] ?? [],
  }));

  return { ...(log as any), exercise_logs };
}
