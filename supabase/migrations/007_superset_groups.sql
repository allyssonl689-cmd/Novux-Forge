-- ============================================================
-- 007_superset_groups.sql
-- Suporte a superset (Fase M): dois exercícios da ficha compartilhando o
-- mesmo `superset_group` são feitos em sequência, sem descanso entre eles
-- — o descanso só acontece depois do último da dupla. Null = exercício
-- solo (comportamento atual, inalterado). Sem tabela nova: é só uma
-- coluna de agrupamento em `workout_exercises`.
-- ============================================================

alter table public.workout_exercises
  add column if not exists superset_group bigint;

comment on column public.workout_exercises.superset_group is
  'Exercícios da mesma ficha com o mesmo valor (não nulo) formam um superset — feitos em sequência, sem descanso entre si';
