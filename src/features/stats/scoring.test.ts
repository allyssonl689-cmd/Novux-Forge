import { describe, it, expect } from 'vitest';
import { computeScore, balanceScore, scoreLabel, type ScoreInput } from './scoring';

const baseInput: ScoreInput = {
  sessionsThisWeek: 0,
  targetWorkouts: 3,
  hardSetsThisWeek: 0,
  volumeThisWeekKg: 0,
  volumeLastWeekKg: 0,
  prCountRecent: 0,
  categoryVolume: { push: 0, pull: 0, legs: 0 },
};

describe('computeScore', () => {
  it('semana perfeita (meta batida, volume no alvo, progressão e equilíbrio) fica perto de 1000', () => {
    const result = computeScore({
      sessionsThisWeek: 3,
      targetWorkouts: 3,
      hardSetsThisWeek: 45, // 3 sessões x 15 séries baseline
      volumeThisWeekKg: 1000,
      volumeLastWeekKg: 0, // sem semana anterior: pontua pela presença de trabalho
      prCountRecent: 3,
      categoryVolume: { push: 10, pull: 10, legs: 10 },
    });
    expect(result.parts).toEqual({ consistency: 400, volume: 200, progression: 180, balance: 200 });
    expect(result.score).toBe(980);
    expect(result.label).toBe('Excelente');
  });

  it('semana totalmente vazia fica em zero e rotulada Crítico', () => {
    const result = computeScore(baseInput);
    expect(result.score).toBe(0);
    expect(result.label).toBe('Crítico');
  });

  it('sessões e volume acima da meta são limitados (clamp) em 400/200, não extrapolam', () => {
    const result = computeScore({
      ...baseInput,
      sessionsThisWeek: 10,
      targetWorkouts: 3,
      hardSetsThisWeek: 999,
    });
    expect(result.parts.consistency).toBe(400);
    expect(result.parts.volume).toBe(200);
  });

  it('progressão compara volume desta semana com a anterior (tendência 0-140) + PRs (0-60)', () => {
    const result = computeScore({
      ...baseInput,
      volumeThisWeekKg: 50,
      volumeLastWeekKg: 100, // manteve metade do volume -> tendência 0.5
      prCountRecent: 0,
    });
    expect(result.parts.progression).toBe(70);
  });

  it('progressão nunca passa de 200 mesmo com tendência e PRs no teto', () => {
    const result = computeScore({
      ...baseInput,
      volumeThisWeekKg: 200,
      volumeLastWeekKg: 100, // trend > 1, é clampado em 1
      prCountRecent: 10,
    });
    expect(result.parts.progression).toBe(200);
  });
});

describe('balanceScore', () => {
  it('sem nenhum volume registrado retorna 0', () => {
    expect(balanceScore({ push: 0, pull: 0, legs: 0 })).toBe(0);
  });

  it('treinou só um padrão de movimento -> penalidade forte (0.15)', () => {
    expect(balanceScore({ push: 20, pull: 0, legs: 0 })).toBe(0.15);
  });

  it('treinou dois de três padrões -> penalidade média (0.5)', () => {
    expect(balanceScore({ push: 20, pull: 20, legs: 0 })).toBe(0.5);
  });

  it('os três padrões com volume idêntico -> equilíbrio perfeito (1)', () => {
    expect(balanceScore({ push: 10, pull: 10, legs: 10 })).toBe(1);
  });

  it('os três treinados mas com dispersão -> penalidade proporcional', () => {
    // push=30, pull=10, legs=10 — total 50, media 16.67, dispersao relativa ~0.267
    expect(balanceScore({ push: 30, pull: 10, legs: 10 })).toBeCloseTo(0.7333, 3);
  });
});

describe('scoreLabel', () => {
  it('respeita os limiares exatos de 400/600/800', () => {
    expect(scoreLabel(0)).toBe('Crítico');
    expect(scoreLabel(399)).toBe('Crítico');
    expect(scoreLabel(400)).toBe('Atenção');
    expect(scoreLabel(599)).toBe('Atenção');
    expect(scoreLabel(600)).toBe('Bom');
    expect(scoreLabel(799)).toBe('Bom');
    expect(scoreLabel(800)).toBe('Excelente');
    expect(scoreLabel(1000)).toBe('Excelente');
  });
});
