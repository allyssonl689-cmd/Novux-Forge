import { supabase } from '@/lib/supabase';
import { calcVolume } from '@/lib/utils';
import { buildInsights, Insight } from './insights';
import { computeScore, ScoreResult } from './scoring';

export interface MuscleVolume {
  muscle: string;
  volumeKg: number;
}

export interface TrainingStats {
  score: ScoreResult;
  insights: Insight[];
  /** Volume por grupo muscular nos últimos 7 dias, do maior para o menor */
  volumeByMuscle: MuscleVolume[];
  sessionsThisWeek: number;
  targetWorkouts: number;
  totalSessions: number;
  hasData: boolean;
}

type Category = 'push' | 'pull' | 'legs';

/** Mapeia grupo muscular → padrão de movimento (Core fica fora do equilíbrio) */
function categoryOf(muscle: string): Category | null {
  const push = ['Peito', 'Ombro', 'Tríceps'];
  const pull = ['Costas', 'Bíceps', 'Trapézio', 'Antebraço', 'Lombar'];
  const legs = ['Quadríceps', 'Isquiotibiais', 'Glúteos', 'Panturrilha'];
  if (push.includes(muscle)) return 'push';
  if (pull.includes(muscle)) return 'pull';
  if (legs.includes(muscle)) return 'legs';
  return null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const EMPTY: TrainingStats = {
  score: { score: 0, label: 'Crítico', parts: { consistency: 0, volume: 0, progression: 0, balance: 0 } },
  insights: buildInsights({
    sessionsThisWeek: 0,
    targetWorkouts: 3,
    prCountRecent: 0,
    categoryVolume: { push: 0, pull: 0, legs: 0 },
    daysSince: { push: null, pull: null, legs: null },
    totalSessions: 0,
  }),
  volumeByMuscle: [],
  sessionsThisWeek: 0,
  targetWorkouts: 3,
  totalSessions: 0,
  hasData: false,
};

async function resolveTarget(): Promise<number> {
  // 1) dias com ficha no plano semanal
  const { count } = await supabase
    .from('weekly_plan')
    .select('weekday', { count: 'exact', head: true });
  if (count && count > 0) return count;

  // 2) dias por semana declarados no onboarding
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user?.id) {
    const { data } = await supabase
      .from('profiles')
      .select('days_per_week')
      .eq('id', auth.user.id)
      .maybeSingle();
    if (data?.days_per_week) return data.days_per_week;
  }
  return 3;
}

export async function fetchTrainingStats(): Promise<TrainingStats> {
  const now = Date.now();
  const windowStart = new Date(now - 14 * DAY_MS);

  // Início da semana atual (domingo) — mesma convenção da Home
  const weekStartDate = new Date();
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  weekStartDate.setHours(0, 0, 0, 0);
  const weekStart = weekStartDate.getTime();
  const lastWeekStart = weekStart - 7 * DAY_MS;
  const rolling7 = now - 7 * DAY_MS;

  // 1) Sessões finalizadas na janela
  const { data: logs, error: logsErr } = await supabase
    .from('workout_logs')
    .select('id, started_at')
    .not('finished_at', 'is', null)
    .gte('started_at', windowStart.toISOString());

  if (logsErr) throw logsErr;
  if (!logs || logs.length === 0) return EMPTY;

  const logDate: Record<string, number> = {};
  for (const l of logs as any[]) logDate[l.id] = new Date(l.started_at).getTime();
  const logIds = Object.keys(logDate);

  // 2) exercise_logs dessas sessões
  const { data: exLogs, error: exErr } = await supabase
    .from('exercise_logs')
    .select('id, workout_log_id, exercise_id')
    .in('workout_log_id', logIds);
  if (exErr) throw exErr;

  const exLogInfo: Record<string, { logId: string; exerciseId: string }> = {};
  const exerciseIds = new Set<string>();
  for (const el of (exLogs ?? []) as any[]) {
    exLogInfo[el.id] = { logId: el.workout_log_id, exerciseId: el.exercise_id };
    exerciseIds.add(el.exercise_id);
  }

  // 3) set_logs dessas execuções
  const exLogIds = Object.keys(exLogInfo);
  let sets: any[] = [];
  if (exLogIds.length > 0) {
    const { data: setRows, error: setErr } = await supabase
      .from('set_logs')
      .select('exercise_log_id, weight_kg, reps, is_warmup, is_personal_record, completed_at')
      .in('exercise_log_id', exLogIds);
    if (setErr) throw setErr;
    sets = setRows ?? [];
  }

  // 4) grupo muscular dos exercícios (catálogo público)
  const muscleOf: Record<string, string> = {};
  if (exerciseIds.size > 0) {
    const { data: exs, error: mErr } = await supabase
      .from('exercises')
      .select('id, muscle_group')
      .in('id', Array.from(exerciseIds));
    if (mErr) throw mErr;
    for (const e of (exs ?? []) as any[]) muscleOf[e.id] = e.muscle_group;
  }

  // ── Agregação ──────────────────────────────────────────────
  const volumeByMuscle: Record<string, number> = {};
  const categoryVolume = { push: 0, pull: 0, legs: 0 };
  const daysSinceMs: Record<Category, number | null> = { push: null, pull: null, legs: null };
  let volumeThisWeek = 0;
  let volumeLastWeek = 0;
  let hardSetsThisWeek = 0;
  let prCountRecent = 0;

  const prSince = now - 14 * DAY_MS;

  for (const s of sets) {
    const info = exLogInfo[s.exercise_log_id];
    if (!info) continue;
    const date = logDate[info.logId];
    const muscle = muscleOf[info.exerciseId];
    const warmup = !!s.is_warmup;
    const vol = warmup ? 0 : calcVolume(s.weight_kg != null ? Number(s.weight_kg) : null, s.reps);

    if (s.is_personal_record && new Date(s.completed_at).getTime() >= prSince) prCountRecent += 1;

    if (!warmup) {
      if (date >= weekStart) {
        volumeThisWeek += vol;
        hardSetsThisWeek += 1;
      } else if (date >= lastWeekStart) {
        volumeLastWeek += vol;
      }
    }

    if (muscle && !warmup) {
      if (date >= rolling7) {
        volumeByMuscle[muscle] = (volumeByMuscle[muscle] ?? 0) + vol;
      }
      const cat = categoryOf(muscle);
      if (cat) {
        categoryVolume[cat] += vol;
        if (daysSinceMs[cat] === null || date > (now - (daysSinceMs[cat] as number) * DAY_MS)) {
          daysSinceMs[cat] = Math.floor((now - date) / DAY_MS);
        }
      }
    }
  }

  const sessionsThisWeek = logIds.filter((id) => logDate[id] >= weekStart).length;
  const targetWorkouts = await resolveTarget();

  const score = computeScore({
    sessionsThisWeek,
    targetWorkouts,
    hardSetsThisWeek,
    volumeThisWeekKg: volumeThisWeek,
    volumeLastWeekKg: volumeLastWeek,
    prCountRecent,
    categoryVolume,
  });

  const insights = buildInsights({
    sessionsThisWeek,
    targetWorkouts,
    prCountRecent,
    categoryVolume,
    daysSince: daysSinceMs,
    totalSessions: logIds.length,
  });

  const muscleList: MuscleVolume[] = Object.entries(volumeByMuscle)
    .map(([muscle, volumeKg]) => ({ muscle, volumeKg }))
    .sort((a, b) => b.volumeKg - a.volumeKg);

  return {
    score,
    insights,
    volumeByMuscle: muscleList,
    sessionsThisWeek,
    targetWorkouts,
    totalSessions: logIds.length,
    hasData: true,
  };
}
