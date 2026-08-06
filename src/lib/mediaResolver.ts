import { supabase } from './supabase';

export type MediaResult = {
  type: 'gif' | 'jpg';
  uri: string;
  /**
   * Quadros para animar poses estáticas (início → fim) dentro do app.
   * Presente só quando a fonte é o Free Exercise DB, que fornece 2 fotos
   * por exercício. GIFs já são animados, então não usam este campo.
   */
  frames?: string[];
  source: 'storage' | 'rapidapi' | 'free-db';
};

const FREE_DB_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

/**
 * Resolve a mídia de um exercício via a Edge Function `cache-exercise-media`
 * — ela decide a fonte (cache já resolvido, RapidAPI ou Free Exercise DB) e
 * grava o resultado com `service_role`, para todo mundo, na primeira vez.
 * O cliente nunca mais escreve direto no bucket (era um risco de segurança:
 * antes, qualquer usuário autenticado podia sobrescrever a mídia de todos).
 *
 * Se a function falhar (rede, cold start, etc.), cai direto no Free
 * Exercise DB sem cache — o app continua funcionando, só sem o benefício
 * do cache compartilhado nessa tentativa.
 */
export async function resolveExerciseMedia(
  slug: string,
  freeDbId: string,
  rapidApiId?: string,
): Promise<MediaResult> {
  try {
    const { data, error } = await supabase.functions.invoke('cache-exercise-media', {
      body: { slug, freeDbId, rapidApiId },
    });
    if (!error && data) return data as MediaResult;
  } catch {
    // segue para o fallback
  }

  const base = `${FREE_DB_BASE}/${freeDbId}`;
  return {
    type: 'jpg',
    uri: `${base}/0.jpg`,
    frames: [`${base}/0.jpg`, `${base}/1.jpg`],
    source: 'free-db',
  };
}
