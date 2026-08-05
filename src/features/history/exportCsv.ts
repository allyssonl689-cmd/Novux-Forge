/**
 * Geração do CSV de histórico — lógica pura, sem rede, testável.
 * Uma linha por série (formato longo), o mais fácil de abrir/filtrar numa
 * planilha. Campos do treino (data, ficha, duração) repetem por linha.
 */

export interface ExportWorkoutLog {
  id: string;
  name: string;
  started_at: string;
  duration_secs: number | null;
}

export interface ExportExerciseLog {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  sort_order: number;
}

export interface ExportSetLog {
  exercise_log_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  is_warmup: boolean;
  is_personal_record: boolean;
}

const HEADER = [
  'Data',
  'Ficha',
  'Exercício',
  'Série',
  'Aquecimento',
  'Peso (kg)',
  'Reps',
  'RPE',
  'Recorde pessoal',
];

/** Escapa aspas e envolve o campo em aspas se contiver vírgula, aspas ou quebra de linha */
function csvField(value: string | number | null): string {
  const str = value === null ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function formatDateBR(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function buildHistoryCsv(
  logs: ExportWorkoutLog[],
  exerciseLogs: ExportExerciseLog[],
  setLogs: ExportSetLog[],
): string {
  const logById = new Map(logs.map((l) => [l.id, l]));
  const exLogById = new Map(exerciseLogs.map((e) => [e.id, e]));

  const rows: string[][] = [];

  for (const set of setLogs) {
    const exLog = exLogById.get(set.exercise_log_id);
    if (!exLog) continue;
    const log = logById.get(exLog.workout_log_id);
    if (!log) continue;

    rows.push([
      formatDateBR(log.started_at),
      log.name,
      exLog.exercise_name,
      String(set.set_number),
      set.is_warmup ? 'sim' : 'não',
      set.weight_kg != null ? String(set.weight_kg) : '',
      set.reps != null ? String(set.reps) : '',
      set.rpe != null ? String(set.rpe) : '',
      set.is_personal_record ? 'sim' : 'não',
    ]);
  }

  const lines = [HEADER, ...rows].map((row) => row.map(csvField).join(','));
  return lines.join('\n');
}
