import { supabase } from '@/lib/supabase';
import { BodyMeasurement } from '@/types/workout';

/** Data local (não UTC) no formato aceito pela coluna `date` do Postgres */
function todayLocalDate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export async function fetchBodyMeasurements(limit = 30): Promise<BodyMeasurement[]> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as BodyMeasurement[]) ?? [];
}

/**
 * Registra o peso de hoje (ou da data informada). Upsert por `measured_at`:
 * pesar de novo no mesmo dia corrige a entrada em vez de duplicar. Também
 * mantém `profiles.body_weight` (usado em progressão/peso corporal) em dia.
 */
export async function logBodyMeasurement(weightKg: number, measuredAt?: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const date = measuredAt ?? todayLocalDate();

  const { error } = await supabase
    .from('body_measurements')
    .upsert(
      { user_id: userId, weight_kg: weightKg, measured_at: date },
      { onConflict: 'user_id,measured_at' },
    );

  if (error) throw error;

  await supabase
    .from('profiles')
    .update({ body_weight: weightKg, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function deleteBodyMeasurement(id: string): Promise<void> {
  const { error } = await supabase.from('body_measurements').delete().eq('id', id);
  if (error) throw error;
}
