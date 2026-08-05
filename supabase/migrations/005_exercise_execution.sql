-- ============================================================
-- 005_exercise_execution.sql
-- Campos de execução prática — o diferencial do app para quem
-- está começando: o que costuma dar errado, como respirar, em que
-- ritmo executar e o que ajustar antes da primeira série.
-- ============================================================

alter table public.exercises
  add column if not exists common_mistakes text[] default '{}',
  add column if not exists setup_steps     text[] default '{}',
  add column if not exists breathing       text,
  add column if not exists tempo           text,
  add column if not exists safety_notes    text,
  add column if not exists video_url       text;

comment on column public.exercises.common_mistakes is 'Erros mais frequentes na execução — o que mais causa lesão e perda de resultado em iniciantes';
comment on column public.exercises.setup_steps is 'Ajustes de banco, apoio e pegada feitos ANTES da primeira série';
comment on column public.exercises.breathing is 'Quando inspirar e expirar durante o movimento';
comment on column public.exercises.tempo is 'Cadência no formato excêntrica-pausa-concêntrica-pausa (ex.: 2-0-1-0)';
comment on column public.exercises.safety_notes is 'Quando parar, como sair da falha, quando trocar o exercício';
comment on column public.exercises.video_url is 'Vídeo curado de execução. Nulo = o app abre uma busca no YouTube pelo nome do exercício';
