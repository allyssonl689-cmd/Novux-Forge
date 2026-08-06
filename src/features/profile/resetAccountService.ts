import { supabase } from '@/lib/supabase';

/**
 * "Resetar conta" (Configurações > Conta): apaga histórico de treinos e
 * fichas, mantendo login e catálogo de exercícios intactos. Reabre o
 * onboarding para gerar fichas novas do zero.
 *
 * `workout_logs` cascade para `exercise_logs`→`set_logs`; `workouts` cascade
 * para `workout_exercises` e `weekly_plan` (ver migrations 001/004) — não
 * precisa apagar essas tabelas manualmente.
 */
export async function resetAccountData(): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const { error: logsErr } = await supabase.from('workout_logs').delete().eq('user_id', userId);
  if (logsErr) throw logsErr;

  const { error: workoutsErr } = await supabase.from('workouts').delete().eq('user_id', userId);
  if (workoutsErr) throw workoutsErr;

  const { error: measurementsErr } = await supabase
    .from('body_measurements')
    .delete()
    .eq('user_id', userId);
  if (measurementsErr) throw measurementsErr;

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      onboarding_completed_at: null,
      goal: null,
      experience_level: null,
      days_per_week: null,
      equipment_profile: null,
      body_weight: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (profileErr) throw profileErr;
}
