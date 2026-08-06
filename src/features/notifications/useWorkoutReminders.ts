import { useEffect } from 'react';
import { useWeeklyPlan } from '@/features/plan/useWeeklyPlan';
import { cancelWorkoutReminders, rescheduleWorkoutReminders } from '@/lib/workoutReminders';
import { useReminderStore } from './reminderStore';

/**
 * Mantém os lembretes semanais sincronizados com a agenda e a preferência
 * do usuário. Monta uma vez na raiz autenticada — reage a qualquer mudança
 * na agenda (trocar dia, aplicar um plano) via invalidação do react-query.
 */
export function useWorkoutReminders() {
  const { data: weeklyPlan } = useWeeklyPlan();
  const enabled = useReminderStore((s) => s.enabled);
  const hour = useReminderStore((s) => s.hour);
  const minute = useReminderStore((s) => s.minute);

  useEffect(() => {
    if (!weeklyPlan) return;

    if (!enabled) {
      cancelWorkoutReminders();
      return;
    }

    const entries = weeklyPlan
      .filter((e) => e.workout_id)
      .map((e) => ({ weekday: e.weekday, workoutName: e.workout_name }));

    rescheduleWorkoutReminders(entries, hour, minute);
  }, [weeklyPlan, enabled, hour, minute]);
}
