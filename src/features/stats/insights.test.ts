import { describe, it, expect } from 'vitest';
import { buildInsights, type InsightInput } from './insights';

const baseInput: InsightInput = {
  sessionsThisWeek: 1,
  targetWorkouts: 3,
  prCountRecent: 0,
  categoryVolume: { push: 10, pull: 10, legs: 10 },
  daysSince: { push: 1, pull: 1, legs: 1 },
  totalSessions: 5,
};

describe('buildInsights', () => {
  it('sem nenhuma sessão, retorna só o insight de empty state', () => {
    const result = buildInsights({ ...baseInput, totalSessions: 0 });
    expect(result).toEqual([
      {
        id: 'empty',
        severity: 'info',
        title: 'Complete alguns treinos para desbloquear seu score e receber orientações.',
      },
    ]);
  });

  it('meta de treinos batida gera insight positivo', () => {
    const result = buildInsights({ ...baseInput, sessionsThisWeek: 3, targetWorkouts: 3 });
    expect(result.find((i) => i.id === 'consistency-ok')).toMatchObject({ severity: 'positive' });
  });

  it('zero treinos na semana gera aviso com ação (não confundir com meta batida)', () => {
    const result = buildInsights({ ...baseInput, sessionsThisWeek: 0 });
    const insight = result.find((i) => i.id === 'consistency-zero');
    expect(insight).toMatchObject({ severity: 'warning' });
    expect(insight?.action).toBeTruthy();
  });

  it('sem meta definida (targetWorkouts=0) não dispara nem o positivo nem o zero', () => {
    const result = buildInsights({ ...baseInput, sessionsThisWeek: 0, targetWorkouts: 0 });
    expect(result.find((i) => i.id === 'consistency-ok')).toBeUndefined();
    // sessionsThisWeek === 0 ainda dispara o aviso de zero, independente da meta
    expect(result.find((i) => i.id === 'consistency-zero')).toBeDefined();
  });

  it('grupo nunca treinado (daysSince null) gera aviso de negligência', () => {
    const result = buildInsights({ ...baseInput, daysSince: { push: 1, pull: 1, legs: null } });
    const insight = result.find((i) => i.id === 'neglected-legs');
    expect(insight).toMatchObject({ severity: 'warning' });
    expect(insight?.title).toContain('não treina');
  });

  it('grupo sem treino há 10+ dias gera aviso com a contagem de dias', () => {
    const result = buildInsights({ ...baseInput, daysSince: { push: 1, pull: 1, legs: 14 } });
    const insight = result.find((i) => i.id === 'neglected-legs');
    expect(insight?.title).toContain('14 dias');
  });

  it('9 dias sem treinar um grupo ainda não conta como negligenciado (limiar é 10)', () => {
    const result = buildInsights({ ...baseInput, daysSince: { push: 1, pull: 1, legs: 9 } });
    expect(result.find((i) => i.id === 'neglected-legs')).toBeUndefined();
  });

  it('empurrar muito acima de puxar (>=1.8x) gera aviso de desequilíbrio postural', () => {
    const result = buildInsights({ ...baseInput, categoryVolume: { push: 100, pull: 50, legs: 10 } });
    expect(result.find((i) => i.id === 'imbalance-push-pull')).toMatchObject({ severity: 'warning' });
  });

  it('puxar muito acima de empurrar gera apenas info, não warning', () => {
    const result = buildInsights({ ...baseInput, categoryVolume: { push: 50, pull: 100, legs: 10 } });
    expect(result.find((i) => i.id === 'imbalance-pull-push')).toMatchObject({ severity: 'info' });
  });

  it('proporção abaixo de 1.8x não dispara nenhum aviso de desequilíbrio', () => {
    const result = buildInsights({ ...baseInput, categoryVolume: { push: 100, pull: 60, legs: 10 } });
    expect(result.find((i) => i.id === 'imbalance-push-pull')).toBeUndefined();
    expect(result.find((i) => i.id === 'imbalance-pull-push')).toBeUndefined();
  });

  it('1 recorde recente usa singular', () => {
    const result = buildInsights({ ...baseInput, prCountRecent: 1 });
    const insight = result.find((i) => i.id === 'prs');
    expect(insight?.title).toBe('1 recorde pessoal nas últimas 2 semanas.');
  });

  it('2+ recordes recentes usa plural (pessoais, não "pessoalis")', () => {
    const result = buildInsights({ ...baseInput, prCountRecent: 2 });
    const insight = result.find((i) => i.id === 'prs');
    expect(insight?.title).toBe('2 recordes pessoais nas últimas 2 semanas.');
  });

  it('sem PRs recentes, não gera o insight de recordes', () => {
    const result = buildInsights({ ...baseInput, prCountRecent: 0 });
    expect(result.find((i) => i.id === 'prs')).toBeUndefined();
  });
});
