-- ============================================================
-- 003_security_hardening.sql
-- Correção dos achados do linter de segurança do Supabase.
-- Aplicada em 2026-07-31.
-- ============================================================

-- ── 1. handle_new_user ──────────────────────────────────────
-- Trigger que cria o profile no cadastro. Estava exposta em
-- POST /rest/v1/rpc/handle_new_user para anon e authenticated, como
-- SECURITY DEFINER e com search_path mutável.
-- A função já qualifica public.profiles, então search_path vazio é seguro.
alter function public.handle_new_user() set search_path = '';

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- O insert em auth.users roda como supabase_auth_admin. Triggers não
-- recheca EXECUTE em tempo de execução, mas o grant explícito evita
-- surpresa em futuras versões do Postgres.
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- ── 2. rls_auto_enable ──────────────────────────────────────
-- Event trigger da plataforma (`ensure_rls`) que habilita RLS em toda
-- tabela criada no schema public — é um guard-rail, foi mantido.
-- Só deixa de ser chamável pela API REST.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- ── 3. Bucket exercise-media ────────────────────────────────
-- O bucket é público: objetos continuam servidos por
-- /storage/v1/object/public/exercise-media/... sem policy nenhuma.
--
-- A policy de SELECT habilitava LISTAR todo o conteúdo do bucket.
-- A de INSERT permitia que qualquer usuário autenticado sobrescrevesse
-- a mídia de todos os exercícios (o mediaResolver fazia upload direto
-- do cliente). O cache do RapidAPI deve migrar para uma Edge Function
-- com service_role — ver ROADMAP.md, seção 4.
drop policy if exists "exercise-media: leitura pública" on storage.objects;
drop policy if exists "exercise-media: insert para cache" on storage.objects;

-- ── Pendente fora do SQL ────────────────────────────────────
-- "Leaked password protection" (checagem no HaveIBeenPwned) continua
-- desativada — é um toggle em Authentication > Policies no painel.
