/**
 * Insights de treino — lógica pura. Cada insight tem severidade e, quando cabe,
 * uma ação recomendada. Regra da marca: estado nunca só por cor — a UI sempre
 * mostra ícone + texto junto da severidade.
 */

export type Severity = 'positive' | 'info' | 'warning' | 'critical';

export interface Insight {
  id: string;
  severity: Severity;
  title: string;
  action?: string;
}

export interface InsightInput {
  sessionsThisWeek: number;
  targetWorkouts: number;
  prCountRecent: number;
  categoryVolume: { push: number; pull: number; legs: number };
  daysSince: { push: number | null; pull: number | null; legs: number | null };
  totalSessions: number;
}

const CATEGORY_LABEL: Record<'push' | 'pull' | 'legs', string> = {
  push: 'empurrar (peito/ombro/tríceps)',
  pull: 'puxar (costas/bíceps)',
  legs: 'pernas',
};

export function buildInsights(input: InsightInput): Insight[] {
  const out: Insight[] = [];

  // Sem histórico ainda
  if (input.totalSessions === 0) {
    return [
      {
        id: 'empty',
        severity: 'info',
        title: 'Complete alguns treinos para desbloquear seu score e receber orientações.',
      },
    ];
  }

  // Consistência
  if (input.sessionsThisWeek >= input.targetWorkouts && input.targetWorkouts > 0) {
    out.push({
      id: 'consistency-ok',
      severity: 'positive',
      title: `${input.sessionsThisWeek} treino${input.sessionsThisWeek > 1 ? 's' : ''} esta semana — meta batida.`,
    });
  } else if (input.sessionsThisWeek === 0) {
    out.push({
      id: 'consistency-zero',
      severity: 'warning',
      title: 'Nenhum treino registrado esta semana.',
      action: 'Que tal começar pelo treino de hoje?',
    });
  }

  // Padrão de movimento negligenciado (não treinado há 10+ dias ou nunca na janela)
  (['push', 'pull', 'legs'] as const).forEach((cat) => {
    const days = input.daysSince[cat];
    if (days === null || days >= 10) {
      out.push({
        id: `neglected-${cat}`,
        severity: 'warning',
        title:
          days === null
            ? `Você não treina ${CATEGORY_LABEL[cat]} no período recente.`
            : `Faz ${days} dias que você não treina ${CATEGORY_LABEL[cat]}.`,
        action: 'Inclua esse grupo no próximo treino para manter o equilíbrio.',
      });
    }
  });

  // Desequilíbrio empurrar × puxar (risco postural clássico do iniciante)
  const { push, pull } = input.categoryVolume;
  if (pull > 0 && push / pull >= 1.8) {
    out.push({
      id: 'imbalance-push-pull',
      severity: 'warning',
      title: 'Seu volume de empurrar está bem acima do de puxar — risco de desequilíbrio postural.',
      action: 'Adicione um dia de puxada (costas) ou reduza o volume de peito/ombro.',
    });
  } else if (push > 0 && pull / push >= 1.8) {
    out.push({
      id: 'imbalance-pull-push',
      severity: 'info',
      title: 'Você está puxando bem mais do que empurrando.',
      action: 'Equilibre com um pouco mais de peito/ombro.',
    });
  }

  // Progressão / recordes
  if (input.prCountRecent > 0) {
    out.push({
      id: 'prs',
      severity: 'positive',
      title: `${input.prCountRecent} recorde${input.prCountRecent > 1 ? 's' : ''} ${input.prCountRecent > 1 ? 'pessoais' : 'pessoal'} nas últimas 2 semanas.`,
    });
  }

  return out;
}
