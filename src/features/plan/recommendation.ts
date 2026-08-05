/**
 * Lógica pura de recomendação — sem rede e sem estado, para ser testável
 * e fácil de auditar. As regras seguem o consenso de que iniciante ganha
 * mais com frequência alta e pouco volume por sessão.
 */

export type Goal = 'hipertrofia' | 'forca' | 'emagrecimento' | 'condicionamento';
export type Experience = 'never' | 'under_year' | 'over_year';
export type Equipment = 'gym' | 'home';

export interface OnboardingAnswers {
  goal: Goal;
  experience: Experience;
  daysPerWeek: number;
  equipment: Equipment;
}

export const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: 'hipertrofia',     label: 'Ganhar massa',        hint: 'Aumentar o volume muscular' },
  { value: 'emagrecimento',   label: 'Emagrecer',           hint: 'Perder gordura mantendo músculo' },
  { value: 'forca',           label: 'Ficar mais forte',    hint: 'Levantar mais carga' },
  { value: 'condicionamento', label: 'Saúde e disposição',  hint: 'Sair do sedentarismo' },
];

export const EXPERIENCE_OPTIONS: { value: Experience; label: string; hint: string }[] = [
  { value: 'never',      label: 'Nunca treinei',       hint: 'Ou parei há mais de um ano' },
  { value: 'under_year', label: 'Menos de um ano',     hint: 'Já conheço os aparelhos' },
  { value: 'over_year',  label: 'Mais de um ano',      hint: 'Treino com constância' },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; hint: string }[] = [
  { value: 'gym',  label: 'Academia',  hint: 'Máquinas, barras e halteres' },
  { value: 'home', label: 'Em casa',   hint: 'Sem equipamento, peso do corpo' },
];

export const DAYS_OPTIONS = [2, 3, 4, 5, 6];

/**
 * Escolhe a divisão mais adequada. Retorna o `slug` de `training_splits`.
 * Quem treina em casa vai sempre para o plano de peso corporal — é o único
 * que não pressupõe equipamento.
 */
export function recommendSplitSlug(answers: OnboardingAnswers): string {
  if (answers.equipment === 'home') return 'casa-3x';

  const { experience, daysPerWeek } = answers;

  if (experience === 'never') {
    // Iniciante absoluto: corpo inteiro mesmo com 4+ dias disponíveis,
    // só migra para superior/inferior quando há tempo para isso
    return daysPerWeek <= 3 ? 'full-body-3x' : 'upper-lower-4x';
  }

  if (experience === 'under_year') {
    return daysPerWeek <= 3 ? 'abc-3x' : 'abcd-4x';
  }

  // over_year
  if (daysPerWeek >= 5) return 'ppl-6x';
  if (daysPerWeek === 4) return 'abcd-4x';
  return 'abc-3x';
}

/**
 * Distribui os treinos na semana deixando os dias de descanso o mais
 * espaçados possível. 0 = domingo, 1 = segunda … 6 = sábado.
 */
export function distributeWeekdays(daysPerWeek: number): number[] {
  const MAP: Record<number, number[]> = {
    1: [1],
    2: [1, 4],              // seg, qui
    3: [1, 3, 5],           // seg, qua, sex
    4: [1, 2, 4, 5],        // seg, ter, qui, sex
    5: [1, 2, 3, 5, 6],     // seg, ter, qua, sex, sáb
    6: [1, 2, 3, 4, 5, 6],  // seg a sáb
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  return MAP[Math.min(7, Math.max(1, daysPerWeek))] ?? MAP[3];
}

export const WEEKDAY_LABEL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Monta a agenda: percorre os dias da semana escolhidos e vai ciclando as
 * fichas do plano. Um ABC de 3 fichas em 6 dias vira A-B-C-A-B-C.
 */
export function buildSchedule<T>(daysPerWeek: number, workouts: T[]): { weekday: number; workout: T }[] {
  if (workouts.length === 0) return [];
  return distributeWeekdays(daysPerWeek).map((weekday, i) => ({
    weekday,
    workout: workouts[i % workouts.length],
  }));
}
