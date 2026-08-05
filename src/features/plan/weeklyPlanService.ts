import { supabase } from '@/lib/supabase';
import { OnboardingAnswers } from './recommendation';

export interface WeeklyPlanEntry {
  weekday: number;
  workout_id: string;
  workout_name: string;
  workout_category: string | null;
  exercise_count: number;
}

export async function fetchWeeklyPlan(): Promise<WeeklyPlanEntry[]> {
  const { data, error } = await supabase
    .from('weekly_plan')
    .select('weekday, workout_id, workouts(name, category, workout_exercises(count))')
    .order('weekday', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    weekday: row.weekday,
    workout_id: row.workout_id,
    workout_name: row.workouts?.name ?? '',
    workout_category: row.workouts?.category ?? null,
    exercise_count: row.workouts?.workout_exercises?.[0]?.count ?? 0,
  }));
}

/** Substitui a agenda inteira — mais simples e previsível que diffs por dia */
export async function setWeeklyPlan(
  entries: { weekday: number; workout_id: string }[],
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const { error: delError } = await supabase
    .from('weekly_plan')
    .delete()
    .eq('user_id', userId);

  if (delError) throw delError;
  if (entries.length === 0) return;

  const { error } = await supabase
    .from('weekly_plan')
    .insert(entries.map((e) => ({ ...e, user_id: userId })));

  if (error) throw error;
}

/** Define (ou remove, com workoutId null) a ficha de um único dia */
export async function setWeekdayWorkout(
  weekday: number,
  workoutId: string | null,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  if (workoutId === null) {
    const { error } = await supabase
      .from('weekly_plan')
      .delete()
      .eq('user_id', userId)
      .eq('weekday', weekday);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('weekly_plan')
    .upsert(
      { user_id: userId, weekday, workout_id: workoutId },
      { onConflict: 'user_id,weekday' },
    );

  if (error) throw error;
}

export interface OnboardingProfile {
  onboarding_completed_at: string | null;
  goal: string | null;
  experience_level: string | null;
  days_per_week: number | null;
  equipment_profile: string | null;
}

export async function fetchOnboardingProfile(): Promise<OnboardingProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed_at, goal, experience_level, days_per_week, equipment_profile')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as OnboardingProfile) ?? null;
}

export async function saveOnboardingAnswers(answers: OnboardingAnswers): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const { error } = await supabase
    .from('profiles')
    .update({
      goal: answers.goal,
      experience_level: answers.experience,
      days_per_week: answers.daysPerWeek,
      equipment_profile: answers.equipment,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

/** Marca o onboarding como visto sem gravar respostas (usuário pulou o wizard) */
export async function skipOnboarding(): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;

  await supabase
    .from('profiles')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', userId);
}
