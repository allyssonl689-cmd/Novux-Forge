import { describe, it, expect } from 'vitest';
import { evaluatePassword, passwordScore, passwordStrengthLabel } from './passwordStrength';

describe('evaluatePassword', () => {
  it('senha vazia falha em todas as regras', () => {
    expect(evaluatePassword('').every((c) => !c.passed)).toBe(true);
  });

  it('checa cada regra isoladamente', () => {
    const byKey = (pw: string, key: string) => evaluatePassword(pw).find((c) => c.key === key)?.passed;

    expect(byKey('short', 'length')).toBe(false);
    expect(byKey('longenough', 'length')).toBe(true);

    expect(byKey('lowercase123!', 'upper')).toBe(false);
    expect(byKey('Uppercase123!', 'upper')).toBe(true);

    expect(byKey('UPPERCASE123!', 'lower')).toBe(false);
    expect(byKey('Uppercase123!', 'lower')).toBe(true);

    expect(byKey('NoNumbers!', 'number')).toBe(false);
    expect(byKey('HasNumber1', 'number')).toBe(true);

    expect(byKey('NoSymbols123', 'symbol')).toBe(false);
    expect(byKey('HasSymbol1!', 'symbol')).toBe(true);
  });

  it('senha forte passa nas 5 regras', () => {
    expect(evaluatePassword('Forte123!').every((c) => c.passed)).toBe(true);
  });
});

describe('passwordScore', () => {
  it('conta quantas regras passaram, de 0 a 5', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('aaaaaaaa')).toBe(2); // length (8+) e lower
    expect(passwordScore('Forte123!')).toBe(5);
  });
});

describe('passwordStrengthLabel', () => {
  it('mapeia os limiares corretamente', () => {
    expect(passwordStrengthLabel(0)).toBe('Fraca');
    expect(passwordStrengthLabel(1)).toBe('Fraca');
    expect(passwordStrengthLabel(2)).toBe('Média');
    expect(passwordStrengthLabel(3)).toBe('Média');
    expect(passwordStrengthLabel(4)).toBe('Boa');
    expect(passwordStrengthLabel(5)).toBe('Forte');
  });
});
