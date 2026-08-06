// ============================================================
// cache-exercise-media
// Fecha o débito de segurança do bucket exercise-media: o cliente não
// escreve mais no Storage (migration 003 já tinha removido a policy de
// insert por ser insegura — qualquer autenticado podia sobrescrever a
// mídia de todos). Só esta função, com service_role, grava.
//
// Fluxo: se `exercises.media_url` já está resolvido, devolve na hora
// (sem tocar Storage/CDN de novo). Senão, tenta RapidAPI (se
// RAPIDAPI_KEY estiver configurada como secret e o exercício tiver
// rapid_api_id) e cai para o Free Exercise DB (2 poses) — cacheia o
// resultado no bucket e grava a URL final em `exercises` para a
// próxima vez.
// ============================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

const FREE_DB_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const BUCKET = "exercise-media";

interface MediaResult {
  type: "gif" | "jpg";
  uri: string;
  frames?: string[];
  source: "storage" | "rapidapi" | "free-db";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Método não suportado." }, 405);
  }

  let body: { slug?: string; freeDbId?: string; rapidApiId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const { slug, freeDbId, rapidApiId } = body;
  if (!slug || !freeDbId) {
    return json({ error: "slug e freeDbId são obrigatórios." }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Já resolvido antes? Devolve direto, sem tocar Storage/CDN de novo.
  const { data: existing } = await admin
    .from("exercises")
    .select("media_url, media_frames")
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.media_url) {
    return json({
      type: existing.media_url.endsWith(".gif") ? "gif" : "jpg",
      uri: existing.media_url,
      frames: existing.media_frames ?? undefined,
      source: "storage",
    } satisfies MediaResult);
  }

  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
  if (rapidApiId && rapidApiKey) {
    try {
      const cached = await cacheFromRapidApi(admin, rapidApiId, slug, rapidApiKey);
      if (cached) {
        await saveResolved(admin, slug, cached);
        return json(cached);
      }
    } catch {
      // cai para o Free Exercise DB
    }
  }

  const cached = await cacheFromFreeDb(admin, freeDbId, slug);
  await saveResolved(admin, slug, cached);
  return json(cached);
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Só grava media_url/media_frames quando a fonte é o próprio Storage — cache de verdade */
async function saveResolved(admin: SupabaseClient, slug: string, result: MediaResult) {
  if (result.source !== "storage") return;
  await admin
    .from("exercises")
    .update({ media_url: result.uri, media_frames: result.frames ?? null })
    .eq("slug", slug);
}

async function cacheFromRapidApi(
  admin: SupabaseClient,
  rapidApiId: string,
  slug: string,
  key: string,
): Promise<MediaResult | null> {
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/exercise/${rapidApiId}`,
    { headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "exercisedb.p.rapidapi.com" } },
  );
  if (!response.ok) return null;

  const exercise = await response.json();
  const gifUrl: string | undefined = exercise.gifUrl;
  if (!gifUrl) return null;

  const gifResponse = await fetch(gifUrl);
  if (!gifResponse.ok) return { type: "gif", uri: gifUrl, source: "rapidapi" };

  const bytes = new Uint8Array(await gifResponse.arrayBuffer());
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(`${slug}/0.gif`, bytes, { contentType: "image/gif", upsert: true });
  if (error) return { type: "gif", uri: gifUrl, source: "rapidapi" };

  const { data } = admin.storage.from(BUCKET).getPublicUrl(`${slug}/0.gif`);
  return { type: "gif", uri: data.publicUrl, source: "storage" };
}

async function cacheFromFreeDb(
  admin: SupabaseClient,
  freeDbId: string,
  slug: string,
): Promise<MediaResult> {
  const base = `${FREE_DB_BASE}/${freeDbId}`;
  const remoteFrames = [`${base}/0.jpg`, `${base}/1.jpg`];

  try {
    const res0 = await fetch(remoteFrames[0]);
    if (!res0.ok) {
      return { type: "jpg", uri: remoteFrames[0], frames: remoteFrames, source: "free-db" };
    }
    const bytes0 = new Uint8Array(await res0.arrayBuffer());
    const { error: err0 } = await admin.storage
      .from(BUCKET)
      .upload(`${slug}/0.jpg`, bytes0, { contentType: "image/jpeg", upsert: true });
    if (err0) return { type: "jpg", uri: remoteFrames[0], frames: remoteFrames, source: "free-db" };

    const res1 = await fetch(remoteFrames[1]);
    if (res1.ok) {
      const bytes1 = new Uint8Array(await res1.arrayBuffer());
      await admin.storage
        .from(BUCKET)
        .upload(`${slug}/1.jpg`, bytes1, { contentType: "image/jpeg", upsert: true });
    }

    const { data: url0 } = admin.storage.from(BUCKET).getPublicUrl(`${slug}/0.jpg`);
    const { data: url1 } = admin.storage.from(BUCKET).getPublicUrl(`${slug}/1.jpg`);
    return {
      type: "jpg",
      uri: url0.publicUrl,
      frames: [url0.publicUrl, url1.publicUrl],
      source: "storage",
    };
  } catch {
    return { type: "jpg", uri: remoteFrames[0], frames: remoteFrames, source: "free-db" };
  }
}
