import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const FREE_DB_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export type MediaResult = {
  type: 'gif' | 'jpg';
  uri: string;
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

  // CAMADA 3: Free Exercise DB (fallback estático)
  return { type: 'jpg', uri: `${FREE_DB_BASE}/${freeDbId}/0.jpg`, source: 'free-db' };
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

  const localPath = `${FileSystem.cacheDirectory}${slug}.gif`;
  const download = await FileSystem.downloadAsync(gifUrl, localPath);
  if (download.status !== 200) return null;

  const base64 = await FileSystem.readAsStringAsync(localPath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from('exercise-media')
    .upload(`${slug}/0.gif`, byteArray, {
      contentType: 'image/gif',
      upsert: true,
    });

  if (error) return null;

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
