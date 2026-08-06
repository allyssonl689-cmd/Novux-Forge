import { supabase } from '@/lib/supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Limpa a sessão só localmente, sem chamar o servidor para revogar o token
 * — usado depois de excluir a conta, quando o usuário já não existe mais
 * no Auth e uma chamada global de logout retornaria erro.
 */
export async function signOutLocal() {
  await supabase.auth.signOut({ scope: 'local' });
}

/**
 * Envia o e-mail de redefinição de senha. O reset em si acontece pelo link do
 * e-mail (fluxo web do Supabase) — ainda não há deep link no app.
 */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
