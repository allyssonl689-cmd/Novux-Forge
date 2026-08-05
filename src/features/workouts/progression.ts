/**
 * Progressão de carga — lógica pura, sem rede, testável.
 * Regra simples e conservadora para iniciante: se na última vez a pessoa
 * bateu o topo da faixa de repetições, sugere um pequeno aumento de carga;
 * caso contrário, repete a carga anterior para consolidar a técnica.
 */

export interface LastPerformance {
  weightKg: number;
  reps: number | null;
}

export interface SeedResult {
  /** Peso sugerido para a primeira série (null = peso corporal / sem carga) */
  weightKg: number | null;
  /** true quando a carga foi aumentada em relação à última vez */
  isProgression: boolean;
}

/** Incremento de carga proporcional ao peso — halteres e barras têm saltos diferentes */
export function weightIncrement(weight: number): number {
  if (weight < 10) return 1;
  if (weight < 40) return 2.5;
  return 5;
}

/** Arredonda para o múltiplo de 0,5 kg mais próximo (menor anilha comum) */
export function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Estimativa de 1RM (fórmula de Epley) — referência para acompanhar força,
 * não uma carga a perseguir. Sem estimativa para séries de peso corporal
 * (sem carga) ou de mais de 12 reps, onde a fórmula perde precisão.
 */
export function estimateOneRepMax(weightKg: number | null, reps: number | null): number | null {
  if (!weightKg || !reps || reps < 1 || reps > 12) return null;
  if (reps === 1) return weightKg;
  return roundHalf(weightKg * (1 + reps / 30));
}

/**
 * Decide a carga inicial de um exercício a partir da última execução.
 * `targetReps` é o topo da faixa alvo definida na ficha.
 */
export function seedWeight(
  last: LastPerformance | null | undefined,
  targetReps: number | null,
  defaultWeightKg: number | null,
): SeedResult {
  if (!last || last.weightKg == null) {
    return { weightKg: defaultWeightKg ?? null, isProgression: false };
  }

  const hitTop =
    last.reps != null && targetReps != null && last.reps >= targetReps;

  if (hitTop) {
    return {
      weightKg: roundHalf(last.weightKg + weightIncrement(last.weightKg)),
      isProgression: true,
    };
  }

  return { weightKg: last.weightKg, isProgression: false };
}

/** Texto curto de "última vez" — ex.: "40 kg × 10" ou "Peso corporal × 12" */
export function formatLastPerformance(last: LastPerformance | null | undefined): string | null {
  if (!last) return null;
  const weight = last.weightKg != null ? `${last.weightKg} kg` : 'Peso corporal';
  return last.reps != null ? `${weight} × ${last.reps}` : weight;
}
