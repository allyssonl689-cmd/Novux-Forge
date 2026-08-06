import { describe, it, expect } from 'vitest';
import { kgToLb, lbToKg, toDisplayWeight, toKg, formatWeight, formatVolume } from './units';

describe('kgToLb / lbToKg', () => {
  it('converte 1kg para ~2.2lb', () => {
    expect(kgToLb(1)).toBeCloseTo(2.20462, 4);
  });

  it('lbToKg é o inverso de kgToLb', () => {
    expect(lbToKg(kgToLb(80))).toBeCloseTo(80, 6);
  });
});

describe('toDisplayWeight', () => {
  it('kg é identidade (arredondada a 1 casa)', () => {
    expect(toDisplayWeight(80, 'kg')).toBe(80);
    expect(toDisplayWeight(80.456, 'kg')).toBe(80.5);
  });

  it('converte kg -> lb', () => {
    expect(toDisplayWeight(100, 'lb')).toBeCloseTo(220.5, 1);
  });

  it('null permanece null em qualquer unidade', () => {
    expect(toDisplayWeight(null, 'kg')).toBeNull();
    expect(toDisplayWeight(null, 'lb')).toBeNull();
  });
});

describe('toKg', () => {
  it('kg é identidade', () => {
    expect(toKg(80, 'kg')).toBe(80);
  });

  it('converte lb -> kg', () => {
    expect(toKg(220, 'lb')).toBeCloseTo(99.79, 1);
  });

  it('round-trip kg -> lb -> kg preserva o valor (a 1 casa)', () => {
    const original = 82.5;
    const displayed = toDisplayWeight(original, 'lb')!;
    expect(toKg(displayed, 'lb')).toBeCloseTo(original, 0);
  });
});

describe('formatWeight', () => {
  it('formata com a unidade', () => {
    expect(formatWeight(80, 'kg')).toBe('80 kg');
    expect(formatWeight(100, 'lb')).toBe('220.5 lb');
  });

  it('null vira travessão', () => {
    expect(formatWeight(null, 'kg')).toBe('—');
  });
});

describe('formatVolume', () => {
  it('kg abaixo de 1000 mostra inteiro', () => {
    expect(formatVolume(850, 'kg')).toEqual({ value: '850', unitLabel: 'kg' });
  });

  it('kg acima de 1000 abrevia em toneladas', () => {
    expect(formatVolume(2450, 'kg')).toEqual({ value: '2.5', unitLabel: 't' });
  });

  it('lb converte antes de decidir o corte de milhar', () => {
    // 500kg = ~1102lb, já passa de 1000 mesmo sem chegar a 1000kg
    const result = formatVolume(500, 'lb');
    expect(result.unitLabel).toBe('k lb');
  });
});
