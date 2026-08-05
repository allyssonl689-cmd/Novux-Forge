import { describe, it, expect } from 'vitest';
import { weightIncrement, seedWeight, formatLastPerformance } from './progression';

describe('weightIncrement', () => {
  it('cargas leves (<10kg) sobem 1kg', () => {
    expect(weightIncrement(4)).toBe(1);
    expect(weightIncrement(9.5)).toBe(1);
  });

  it('cargas médias (10-40kg) sobem 2.5kg', () => {
    expect(weightIncrement(10)).toBe(2.5);
    expect(weightIncrement(39.5)).toBe(2.5);
  });

  it('cargas pesadas (>=40kg) sobem 5kg', () => {
    expect(weightIncrement(40)).toBe(5);
    expect(weightIncrement(100)).toBe(5);
  });
});

describe('seedWeight', () => {
  it('sem última execução, usa o peso padrão da ficha e não marca progressão', () => {
    expect(seedWeight(null, 12, 20)).toEqual({ weightKg: 20, isProgression: false });
    expect(seedWeight(undefined, 12, null)).toEqual({ weightKg: null, isProgression: false });
  });

  it('última execução sem peso registrado (peso corporal) cai no default, ignora reps', () => {
    expect(seedWeight({ weightKg: null as unknown as number, reps: 15 }, 12, null)).toEqual({
      weightKg: null,
      isProgression: false,
    });
  });

  it('bateu o topo da faixa de reps -> sugere aumento arredondado para 0.5kg', () => {
    // 38kg + incremento 2.5 = 40.5, já é múltiplo de 0.5
    expect(seedWeight({ weightKg: 38, reps: 10 }, 10, null)).toEqual({
      weightKg: 40.5,
      isProgression: true,
    });
  });

  it('reps acima do alvo também conta como bateu o topo', () => {
    expect(seedWeight({ weightKg: 8, reps: 15 }, 12, null).isProgression).toBe(true);
  });

  it('não bateu o topo -> repete a carga anterior, sem progressão', () => {
    expect(seedWeight({ weightKg: 20, reps: 8 }, 12, null)).toEqual({
      weightKg: 20,
      isProgression: false,
    });
  });

  it('sem targetReps definido na ficha, nunca marca progressão automática', () => {
    expect(seedWeight({ weightKg: 20, reps: 15 }, null, null)).toEqual({
      weightKg: 20,
      isProgression: false,
    });
  });

  it('arredonda para o múltiplo de 0.5kg mais próximo', () => {
    // 41kg + incremento 5 = 46 (já múltiplo de 0.5)
    expect(seedWeight({ weightKg: 41, reps: 10 }, 10, null).weightKg).toBe(46);
  });
});

describe('formatLastPerformance', () => {
  it('sem última execução retorna null', () => {
    expect(formatLastPerformance(null)).toBeNull();
    expect(formatLastPerformance(undefined)).toBeNull();
  });

  it('com peso e reps: "40 kg × 10"', () => {
    expect(formatLastPerformance({ weightKg: 40, reps: 10 })).toBe('40 kg × 10');
  });

  it('peso corporal (sem weightKg) com reps: "Peso corporal × 12"', () => {
    expect(formatLastPerformance({ weightKg: null as unknown as number, reps: 12 })).toBe('Peso corporal × 12');
  });

  it('sem reps registrados, mostra só o peso', () => {
    expect(formatLastPerformance({ weightKg: 40, reps: null })).toBe('40 kg');
  });
});
