# Banco de dados — ordem de execução

Rode os scripts nesta ordem no SQL Editor do Supabase (ou via `supabase db push`).
Os seeds são idempotentes: rodar de novo não duplica dados.

| # | Arquivo | O que faz |
|---|---|---|
| 1 | `migrations/001_initial_schema.sql` | Tabelas principais, RLS, bucket `exercise-media` |
| 2 | `seed/exercises_seed.sql` | 15 exercícios iniciais |
| 3 | `migrations/002_training_splits.sql` | Planos sugeridos (`training_splits`, `split_days`, `split_day_exercises`) + coluna `workouts.source_split_day_id` |
| 4 | `seed/002_exercises_expansion.sql` | Corrige `free_db_id` inválidos e amplia o catálogo para 69 exercícios |
| 5 | `seed/003_training_splits_seed.sql` | 6 planos prontos (Corpo Inteiro, Em Casa, Superior/Inferior, ABC, ABCD, PPL) |
| 6 | `migrations/003_security_hardening.sql` | Revoga EXECUTE de funções expostas, fixa search_path, fecha listagem/escrita do bucket |
| 7 | `migrations/004_weekly_plan.sql` | Plano semanal + respostas do onboarding em `profiles` |
| 8 | `migrations/005_exercise_execution.sql` | Campos de execução prática (`common_mistakes`, `breathing`, `tempo`, etc.) |
| 9 | `seed/004_exercise_execution_content.sql` | Preenche execução prática dos 69 exercícios |
| 10 | `migrations/006_body_measurements.sql` | Histórico de peso corporal (`body_measurements`), uma entrada por dia |
| 11 | `migrations/007_superset_groups.sql` | Coluna `workout_exercises.superset_group` — agrupa exercícios em superset |

> **A ordem importa entre 4 e 5.** O seed de planos referencia exercícios por `slug`;
> se o catálogo ampliado não estiver carregado, os exercícios faltantes são ignorados
> em silêncio e os dias ficam incompletos. A consulta de verificação está comentada
> no fim do arquivo `003`.

## Mídia dos exercícios

Os `free_db_id` foram validados contra o
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db) — a Camada 3 do
`mediaResolver` monta a URL `.../exercises/{free_db_id}/0.jpg`.

Os `rapid_api_id` do seed inicial **não foram verificados** e ficam `null` nos exercícios
novos. Enquanto `EXPO_PUBLIC_RAPIDAPI_KEY` não estiver configurada a Camada 2 nem é
acionada; ao configurá-la, confira os IDs antes — um ID errado baixa o GIF de outro
exercício e o cacheia no Storage.

## Pendência de segurança conhecida

A policy `exercise-media: insert para cache` permite que **qualquer usuário autenticado**
escreva no bucket público, e o `mediaResolver` faz upload direto do cliente. Isso deve
migrar para uma Edge Function com `service_role` (ver `ROADMAP.md`, seção 4).
