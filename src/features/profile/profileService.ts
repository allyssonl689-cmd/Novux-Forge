import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  body_weight: number | null;
  goal: string | null;
  experience_level: string | null;
  days_per_week: number | null;
  equipment_profile: string | null;
  onboarding_completed_at: string | null;
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, username, display_name, avatar_url, body_weight, goal, experience_level, days_per_week, equipment_profile, onboarding_completed_at',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserProfile) ?? null;
}

export async function updateProfile(
  patch: Partial<Pick<UserProfile, 'display_name' | 'body_weight'>>,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;

  // Mantém o full_name do auth em sincronia com o nome de exibição
  if (patch.display_name !== undefined) {
    await supabase.auth.updateUser({ data: { full_name: patch.display_name } });
  }
}

/**
 * Reabre o onboarding: zera a flag para o usuário refazer o wizard.
 * Não apaga fichas nem plano — só permite gerar de novo.
 */
export async function resetOnboarding(): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;

  await supabase
    .from('profiles')
    .update({ onboarding_completed_at: null })
    .eq('id', userId);
}
