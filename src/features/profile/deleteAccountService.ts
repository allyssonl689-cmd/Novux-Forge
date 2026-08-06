import { supabase } from '@/lib/supabase';

/**
 * Exclusão de conta (LGPD) — irreversível. Chama a Edge Function
 * `delete-account`, a única com a service_role key necessária para apagar
 * o usuário do Supabase Auth. Isso cascade-deleta todos os dados
 * (profiles, fichas, histórico, peso corporal) — ver a função para detalhes.
 */
export async function deleteAccountPermanently(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}
