import { File } from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { BodyMeasurement } from '@/types/workout';

const PHOTOS_BUCKET = 'progress-photos';

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
 * Retorna a linha (com `id`) — necessário para anexar uma foto depois.
 */
export async function logBodyMeasurement(
  weightKg: number,
  measuredAt?: string,
): Promise<BodyMeasurement> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const date = measuredAt ?? todayLocalDate();

  const { data, error } = await supabase
    .from('body_measurements')
    .upsert(
      { user_id: userId, weight_kg: weightKg, measured_at: date },
      { onConflict: 'user_id,measured_at' },
    )
    .select('*')
    .single();

  if (error) throw error;

  await supabase
    .from('profiles')
    .update({ body_weight: weightKg, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return data as BodyMeasurement;
}

/** Remove a pesagem e a foto associada (se houver) do Storage */
export async function deleteBodyMeasurement(measurement: BodyMeasurement): Promise<void> {
  const { error } = await supabase.from('body_measurements').delete().eq('id', measurement.id);
  if (error) throw error;

  if (measurement.photo_path) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([measurement.photo_path]);
  }
}

/**
 * Envia a foto de progresso para o bucket privado (path `{user_id}/{measurement_id}.jpg`,
 * restrito por RLS) e grava o caminho na pesagem. `upsert: true` permite
 * trocar a foto do dia sem precisar apagar a anterior manualmente.
 */
export async function uploadProgressPhoto(
  measurementId: string,
  localUri: string,
): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const path = `${userId}/${measurementId}.jpg`;
  const file = new File(localUri);
  const bytes = await file.bytes();

  const { error: uploadErr } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
  if (uploadErr) throw uploadErr;

  const { error: updateErr } = await supabase
    .from('body_measurements')
    .update({ photo_path: path })
    .eq('id', measurementId);
  if (updateErr) throw updateErr;

  return path;
}

export async function removeProgressPhoto(measurementId: string, path: string): Promise<void> {
  await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
  const { error } = await supabase
    .from('body_measurements')
    .update({ photo_path: null })
    .eq('id', measurementId);
  if (error) throw error;
}

/** URL assinada temporária (bucket privado) — válida por 1 hora */
export async function getProgressPhotoUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
