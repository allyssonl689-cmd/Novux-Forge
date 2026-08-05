import { describe, it, expect } from 'vitest';
import { recommendSplitSlug, distributeWeekdays, buildSchedule, type OnboardingAnswers } from './recommendation';

const answers = (over: Partial<OnboardingAnswers>): OnboardingAnswers => ({
  goal: 'hipertrofia',
  experience: 'never',
  daysPerWeek: 3,
  equipment: 'gym',
  ...over,
});

describe('recommendSplitSlug', () => {
  it('treino em casa sempre vai para o plano de peso corporal, mesmo com muitos dias e experiência', () => {
    expect(recommendSplitSlug(answers({ equipment: 'home', experience: 'over_year', daysPerWeek: 6 }))).toBe('casa-3x');
  });

  it('nunca treinou + até 3 dias -> corpo inteiro', () => {
    expect(recommendSplitSlug(answers({ experience: 'never', daysPerWeek: 3 }))).toBe('full-body-3x');
  });

  it('nunca treinou + 4+ dias -> superior/inferior (não pula para divisões de mais dias)', () => {
    expect(recommendSplitSlug(answers({ experience: 'never', daysPerWeek: 4 }))).toBe('upper-lower-4x');
    expect(recommendSplitSlug(answers({ experience: 'never', daysPerWeek: 6 }))).toBe('upper-lower-4x');
  });

  it('menos de 1 ano + até 3 dias -> ABC', () => {
    expect(recommendSplitSlug(answers({ experience: 'under_year', daysPerWeek: 2 }))).toBe('abc-3x');
  });

  it('menos de 1 ano + 4+ dias -> ABCD', () => {
    expect(recommendSplitSlug(answers({ experience: 'under_year', daysPerWeek: 5 }))).toBe('abcd-4x');
  });

  it('mais de 1 ano + 5 ou 6 dias -> PPL', () => {
    expect(recommendSplitSlug(answers({ experience: 'over_year', daysPerWeek: 5 }))).toBe('ppl-6x');
    expect(recommendSplitSlug(answers({ experience: 'over_year', daysPerWeek: 6 }))).toBe('ppl-6x');
  });

  it('mais de 1 ano + exatamente 4 dias -> ABCD (não PPL)', () => {
    expect(recommendSplitSlug(answers({ experience: 'over_year', daysPerWeek: 4 }))).toBe('abcd-4x');
  });

  it('mais de 1 ano + até 3 dias -> ABC', () => {
    expect(recommendSplitSlug(answers({ experience: 'over_year', daysPerWeek: 3 }))).toBe('abc-3x');
  });
});

describe('distributeWeekdays', () => {
  it('espaça os dias de descanso para 2 a 6 dias por semana', () => {
    expect(distributeWeekdays(2)).toEqual([1, 4]);
    expect(distributeWeekdays(3)).toEqual([1, 3, 5]);
    expect(distributeWeekdays(4)).toEqual([1, 2, 4, 5]);
    expect(distributeWeekdays(5)).toEqual([1, 2, 3, 5, 6]);
    expect(distributeWeekdays(6)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('7 dias inclui domingo', () => {
    expect(distributeWeekdays(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('valores fora do range (0, negativo, 8+) ficam dentro de 1..7', () => {
    expect(distributeWeekdays(0)).toEqual([1]);
    expect(distributeWeekdays(-3)).toEqual([1]);
    expect(distributeWeekdays(10)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('buildSchedule', () => {
  it('lista vazia de fichas resulta em agenda vazia', () => {
    expect(buildSchedule(5, [])).toEqual([]);
  });

  it('cicla as fichas quando há mais dias que fichas (ABC em 6 dias -> A-B-C-A-B-C)', () => {
    const result = buildSchedule(6, ['A', 'B', 'C']);
    expect(result.map((r) => r.workout)).toEqual(['A', 'B', 'C', 'A', 'B', 'C']);
    expect(result.map((r) => r.weekday)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('mais fichas que dias usa só as primeiras N', () => {
    const result = buildSchedule(2, ['A', 'B', 'C', 'D']);
    expect(result.map((r) => r.workout)).toEqual(['A', 'B']);
  });
});
