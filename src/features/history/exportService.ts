import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/lib/supabase';
import { buildHistoryCsv, ExportExerciseLog, ExportSetLog, ExportWorkoutLog } from './exportCsv';

/** Mesmo padrão multi-query dos outros serviços de histórico — evita join circular no RLS */
async function fetchExportData(): Promise<{
  logs: ExportWorkoutLog[];
  exerciseLogs: ExportExerciseLog[];
  setLogs: ExportSetLog[];
}> {
  const { data: logs, error: logsErr } = await supabase
    .from('workout_logs')
    .select('id, name, started_at, duration_secs')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: true });

  if (logsErr) throw logsErr;
  if (!logs || logs.length === 0) return { logs: [], exerciseLogs: [], setLogs: [] };

  const logIds = logs.map((l) => l.id);

  const { data: exerciseLogs, error: elErr } = await supabase
    .from('exercise_logs')
    .select('id, workout_log_id, exercise_name, sort_order')
    .in('workout_log_id', logIds);

  if (elErr) throw elErr;

  const exLogIds = (exerciseLogs ?? []).map((e) => e.id);
  let setLogs: ExportSetLog[] = [];
  if (exLogIds.length > 0) {
    const { data, error: slErr } = await supabase
      .from('set_logs')
      .select('exercise_log_id, set_number, weight_kg, reps, rpe, is_warmup, is_personal_record')
      .in('exercise_log_id', exLogIds);

    if (slErr) throw slErr;
    setLogs = data ?? [];
  }

  return { logs, exerciseLogs: exerciseLogs ?? [], setLogs };
}

/**
 * Gera o CSV do histórico completo e abre o menu nativo de compartilhamento
 * (salvar em arquivos, enviar por e-mail, abrir no Sheets etc.).
 */
export async function exportHistoryCsv(): Promise<void> {
  const { logs, exerciseLogs, setLogs } = await fetchExportData();
  if (logs.length === 0) {
    throw new Error('Sem treinos concluídos para exportar ainda.');
  }

  const csv = buildHistoryCsv(logs, exerciseLogs, setLogs);
  const file = new File(Paths.cache, 'novux-forge-historico.csv');
  file.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Compartilhamento não disponível neste dispositivo.');

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Exportar histórico de treinos',
  });
}
