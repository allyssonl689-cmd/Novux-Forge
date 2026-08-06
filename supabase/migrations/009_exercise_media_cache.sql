-- ============================================================
-- 009_exercise_media_cache.sql
-- Fecha o débito de segurança da Fase H: o cliente não escreve mais no
-- bucket exercise-media (isso motivou a remoção da policy de insert na
-- migration 003) — agora só a Edge Function cache-exercise-media grava,
-- usando service_role. Além do Storage, a URL final fica guardada aqui
-- (media_url/media_frames) para não precisar checar de novo a cada
-- carregamento — resolve também o débito "2 requisições HEAD por
-- exercício" citado na seção 4 do ROADMAP.
-- ============================================================

alter table public.exercises
  add column if not exists media_url text,
  add column if not exists media_frames text[];

comment on column public.exercises.media_url is
  'URL pública já resolvida (Storage ou CDN de fallback) — evita checar de novo a cada carregamento';
comment on column public.exercises.media_frames is
  'Poses [início, fim] quando a fonte é o Free Exercise DB (2 fotos, sem GIF animado)';
