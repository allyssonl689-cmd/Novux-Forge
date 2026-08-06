import { WeightUnit } from '@/features/settings/unitStore';

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/**
 * Tudo é salvo em kg (valor canônico) — estas funções só convertem para
 * exibição/entrada na unidade escolhida pelo usuário. Trocar a unidade nas
 * Configurações não migra nenhum dado, só muda como os mesmos números
 * salvos aparecem na tela.
 */
export function toDisplayWeight(kg: number | null, unit: WeightUnit): number | null {
  if (kg === null) return null;
  const value = unit === 'lb' ? kgToLb(kg) : kg;
  return Math.round(value * 10) / 10;
}

/** Converte um valor digitado na unidade de exibição de volta para kg */
export function toKg(value: number, unit: WeightUnit): number {
  const kg = unit === 'lb' ? lbToKg(value) : value;
  return Math.round(kg * 100) / 100;
}

export function formatWeight(kg: number | null, unit: WeightUnit): string {
  const display = toDisplayWeight(kg, unit);
  if (display === null) return '—';
  return `${display} ${unit}`;
}

/**
 * Volume (peso × reps somado) — números grandes, então abrevia acima de
 * 1000 na unidade de exibição. Separa valor e unidade (em vez de embutir o
 * "t"/"k" dentro do valor) para caber tanto num Text único quanto num
 * componente que mostra valor e unidade em slots diferentes (StatCard).
 */
export function formatVolume(kg: number, unit: WeightUnit): { value: string; unitLabel: string } {
  const display = unit === 'lb' ? kgToLb(kg) : kg;
  if (display >= 1000) {
    return { value: (display / 1000).toFixed(1), unitLabel: unit === 'lb' ? 'k lb' : 't' };
  }
  return { value: Math.round(display).toString(), unitLabel: unit };
}
