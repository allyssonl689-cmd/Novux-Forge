/**
 * Regras de força de senha — lógica pura, testável. Espelha o checklist do
 * novux-finance/mobile: 5 critérios simples e claros para o iniciante.
 */

export interface PasswordCheck {
  key: string;
  label: string;
  passed: boolean;
}

export function evaluatePassword(pw: string): PasswordCheck[] {
  return [
    { key: 'length', label: 'Pelo menos 8 caracteres', passed: pw.length >= 8 },
    { key: 'upper', label: 'Uma letra maiúscula', passed: /[A-Z]/.test(pw) },
    { key: 'lower', label: 'Uma letra minúscula', passed: /[a-z]/.test(pw) },
    { key: 'number', label: 'Um número', passed: /\d/.test(pw) },
    { key: 'symbol', label: 'Um símbolo (!@#$…)', passed: /[^A-Za-z0-9]/.test(pw) },
  ];
}

/** Quantidade de regras atendidas (0–5) */
export function passwordScore(pw: string): number {
  return evaluatePassword(pw).filter((c) => c.passed).length;
}

/** Rótulo qualitativo a partir do score */
export function passwordStrengthLabel(score: number): string {
  if (score <= 1) return 'Fraca';
  if (score <= 3) return 'Média';
  if (score === 4) return 'Boa';
  return 'Forte';
}
