import { describe, it, expect } from 'vitest';
import { buildHistoryCsv } from './exportCsv';

describe('buildHistoryCsv', () => {
  it('sem dados, retorna só o cabeçalho', () => {
    const csv = buildHistoryCsv([], [], []);
    expect(csv).toBe(
      'Data,Ficha,Exercício,Série,Aquecimento,Peso (kg),Reps,RPE,Recorde pessoal',
    );
  });

  it('monta uma linha por série, com os dados do treino/exercício repetidos', () => {
    const csv = buildHistoryCsv(
      [{ id: 'w1', name: 'Treino A', started_at: '2026-08-05T12:00:00.000Z', duration_secs: 3600 }],
      [{ id: 'e1', workout_log_id: 'w1', exercise_name: 'Supino reto', sort_order: 0 }],
      [
        { exercise_log_id: 'e1', set_number: 1, weight_kg: 40, reps: 10, rpe: 8, is_warmup: false, is_personal_record: true },
        { exercise_log_id: 'e1', set_number: 2, weight_kg: 40, reps: 8, rpe: null, is_warmup: false, is_personal_record: false },
      ],
    );
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('05/08/2026,Treino A,Supino reto,1,não,40,10,8,sim');
    expect(lines[2]).toBe('05/08/2026,Treino A,Supino reto,2,não,40,8,,não');
  });

  it('ignora séries/exercícios órfãos (sem log correspondente)', () => {
    const csv = buildHistoryCsv(
      [],
      [{ id: 'e1', workout_log_id: 'missing', exercise_name: 'X', sort_order: 0 }],
      [{ exercise_log_id: 'e1', set_number: 1, weight_kg: 10, reps: 5, rpe: null, is_warmup: false, is_personal_record: false }],
    );
    expect(csv.split('\n')).toHaveLength(1);
  });

  it('escapa campos com vírgula ou aspas', () => {
    const csv = buildHistoryCsv(
      [{ id: 'w1', name: 'Treino, "pesado"', started_at: '2026-08-05T12:00:00.000Z', duration_secs: null }],
      [{ id: 'e1', workout_log_id: 'w1', exercise_name: 'Rosca', sort_order: 0 }],
      [{ exercise_log_id: 'e1', set_number: 1, weight_kg: 10, reps: 5, rpe: null, is_warmup: false, is_personal_record: false }],
    );
    expect(csv.split('\n')[1]).toContain('"Treino, ""pesado"""');
  });
});
