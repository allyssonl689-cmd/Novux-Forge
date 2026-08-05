import { supabase } from './supabase';

const FREE_DB_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export type MediaResult = {
  type: 'gif' | 'jpg';
  uri: string;
  /**
   * Quadros para animar poses estáticas (início → fim) dentro do app.
   * Presente só na Camada 3 (Free DB), que fornece 2 fotos por exercício.
   * GIFs já são animados, então não usam este campo.
   */
  frames?: string[];
  source: 'storage' | 'rapidapi' | 'free-db';
};

export async function resolveExerciseMedia(
  slug: string,
  freeDbId: string,
  rapidApiId?: string,
): Promise<MediaResult> {
  // CAMADA 1: Supabase Storage
  const { data: storageGif } = supabase.storage
    .from('exercise-media')
    .getPublicUrl(`${slug}/0.gif`);

  if (await urlExists(storageGif.publicUrl)) {
    return { type: 'gif', uri: storageGif.publicUrl, source: 'storage' };
  }

  const { data: storageJpg } = supabase.storage
    .from('exercise-media')
    .getPublicUrl(`${slug}/0.jpg`);

  if (await urlExists(storageJpg.publicUrl)) {
    return { type: 'jpg', uri: storageJpg.publicUrl, source: 'storage' };
  }

  // CAMADA 2: ExerciseDB RapidAPI (com cache automático)
  if (rapidApiId && process.env.EXPO_PUBLIC_RAPIDAPI_KEY) {
    try {
      const gifUri = await fetchAndCacheRapidApiGif(rapidApiId, slug);
      if (gifUri) return { type: 'gif', uri: gifUri, source: 'rapidapi' };
    } catch {
      // falhou silenciosamente → cai na Camada 3
    }
  }

  // CAMADA 3: Free Exercise DB — 2 poses (início e fim) para animar no app
  const base = `${FREE_DB_BASE}/${freeDbId}`;
  return {
    type: 'jpg',
    uri: `${base}/0.jpg`,
    frames: [`${base}/0.jpg`, `${base}/1.jpg`],
    source: 'free-db',
  };
}

async function fetchAndCacheRapidApiGif(
  rapidApiId: string,
  slug: string,
): Promise<string | null> {
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/exercise/${rapidApiId}`,
    {
      headers: {
        'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    },
  );

  if (!response.ok) return null;

  const exercise = await response.json();
  const gifUrl: string = exercise.gifUrl;
  if (!gifUrl) return null;

  // Tenta cachear no Storage. Desde a migration 003 o cliente não tem mais
  // permissão de escrita no bucket (qualquer autenticado podia sobrescrever a
  // mídia de todos), então isso normalmente falha — e tudo bem: o GIF da CDN
  // é usado direto e o expo-image cuida do cache local.
  // O cache permanente volta quando o upload virar Edge Function com service_role.
  try {
    const gifResponse = await fetch(gifUrl);
    if (!gifResponse.ok) return gifUrl;

    const bytes = new Uint8Array(await gifResponse.arrayBuffer());

    const { error } = await supabase.storage
      .from('exercise-media')
      .upload(`${slug}/0.gif`, bytes, {
        contentType: 'image/gif',
        upsert: true,
      });

    if (error) return gifUrl;
  } catch {
    return gifUrl;
  }

  const { data } = supabase.storage
    .from('exercise-media')
    .getPublicUrl(`${slug}/0.gif`);

  return data.publicUrl;
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
