/**
 * Score de treino 0–1000 — lógica pura, testável (inspirado no score 0–1000 do
 * novux-finance, adaptado para treino). Quatro componentes:
 *
 *   Consistência (0–400) — treinos feitos na semana vs alvo (plano/perfil/padrão)
 *   Volume        (0–200) — séries de trabalho na semana vs baseline
 *   Progressão    (0–200) — tendência de volume + recordes recentes
 *   Equilíbrio    (0–200) — distribuição entre empurrar / puxar / pernas
 */

export interface ScoreInput {
  sessionsThisWeek: number;
  targetWorkouts: number;
  hardSetsThisWeek: number;
  volumeThisWeekKg: number;
  volumeLastWeekKg: number;
  prCountRecent: number;
  categoryVolume: { push: number; pull: number; legs: number };
}

export interface ScoreBreakdown {
  consistency: number;
  volume: number;
  progression: number;
  balance: number;
}

export interface ScoreResult {
  score: number; // 0–1000
  label: 'Crítico' | 'Atenção' | 'Bom' | 'Excelente';
  parts: ScoreBreakdown;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** ~15 séries de trabalho por sessão é uma referência saudável para a semana */
const SETS_PER_SESSION_BASELINE = 15;

export function computeScore(input: ScoreInput): ScoreResult {
  const target = Math.max(1, input.targetWorkouts);

  // Consistência — treinos feitos vs alvo
  const consistency = Math.round(clamp01(input.sessionsThisWeek / target) * 400);

  // Volume — séries de trabalho vs baseline proporcional ao alvo
  const volumeTarget = target * SETS_PER_SESSION_BASELINE;
  const volume = Math.round(clamp01(input.hardSetsThisWeek / volumeTarget) * 200);

  // Progressão — manteve/aumentou o volume vs semana anterior + PRs recentes
  let progression: number;
  if (input.volumeLastWeekKg <= 0) {
    // Sem base de comparação: pontua pela simples presença de trabalho
    progression = input.volumeThisWeekKg > 0 ? 120 : 0;
  } else {
    const trend = clamp01(input.volumeThisWeekKg / input.volumeLastWeekKg); // 1.0 = manteve
    progression = trend * 140;
  }
  progression += clamp01(input.prCountRecent / 3) * 60; // PRs recentes até +60
  progression = Math.round(Math.min(200, progression));

  // Equilíbrio — quão parelhos estão empurrar / puxar / pernas
  const balance = Math.round(balanceScore(input.categoryVolume) * 200);

  const score = consistency + volume + progression + balance;

  return {
    score,
    label: scoreLabel(score),
    parts: { consistency, volume, progression, balance },
  };
}

/**
 * 1.0 = perfeitamente equilibrado; penaliza forte quando uma categoria está
 * zerada e proporcionalmente quando há muita dispersão entre elas.
 */
export function balanceScore(cat: { push: number; pull: number; legs: number }): number {
  const values = [cat.push, cat.pull, cat.legs];
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;

  const trained = values.filter((v) => v > 0).length;
  if (trained <= 1) return 0.15; // treinou só um padrão de movimento
  if (trained === 2) return 0.5; // faltou um padrão inteiro

  // Todas treinadas: mede a dispersão relativa (0 = iguais)
  const mean = total / 3;
  const spread = values.reduce((acc, v) => acc + Math.abs(v - mean), 0) / (2 * total);
  return clamp01(1 - spread);
}

export function scoreLabel(score: number): ScoreResult['label'] {
  if (score < 400) return 'Crítico';
  if (score < 600) return 'Atenção';
  if (score < 800) return 'Bom';
  return 'Excelente';
}
