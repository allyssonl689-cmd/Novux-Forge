// ============================================================
// delete-account
// Exclusão de conta (LGPD). O cliente nunca tem a service_role key —
// só uma Edge Function pode chamar auth.admin.deleteUser. Apagar o
// usuário cascade-deleta profiles/workouts/workout_logs/exercise_logs/
// set_logs/weekly_plan/body_measurements (todos com
// `references auth.users(id) on delete cascade`) — só o Storage
// (fotos de progresso) precisa de limpeza explícita antes.
// ============================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Não autenticado." }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  // Identifica quem está chamando a partir do JWT recebido — nunca confia
  // em um userId enviado pelo cliente.
  const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Sessão inválida." }), { status: 401 });
  }
  const userId = userData.user.id;

  const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { data: photos } = await supabaseAdmin.storage.from("progress-photos").list(userId);
    if (photos && photos.length > 0) {
      await supabaseAdmin.storage
        .from("progress-photos")
        .remove(photos.map((p) => `${userId}/${p.name}`));
    }
  } catch {
    // Falha ao limpar fotos não deve impedir a exclusão da conta.
  }

  const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteErr) {
    return new Response(JSON.stringify({ error: deleteErr.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
