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
| 12 | `seed/005_catalog_enrichment.sql` | Renomeia "Voador" para incluir "Crucifixo na Máquina"; adiciona Puxada e Mergulho Assistidos (Gravitron) — 69 → 71 exercícios |
| 13 | `seed/006_catalog_expansion.sql` | Expansão moderada: 36 exercícios novos, priorizando trapézio/lombar/antebraço/panturrilha/glúteos (mais rasos) — 71 → 107 exercícios |
| 14 | `migrations/008_progress_photos.sql` | Coluna `body_measurements.photo_path` + bucket privado `progress-photos` com RLS por pasta de usuário |
| 15 | `migrations/009_exercise_media_cache.sql` | Colunas `exercises.media_url`/`media_frames` — cache da URL final já resolvida, escrito só pela Edge Function `cache-exercise-media` |

## Edge Functions

| Função | O que faz |
|---|---|
| `delete-account` | Exclusão de conta (LGPD) — valida o JWT do chamador, limpa fotos de progresso no Storage e chama `auth.admin.deleteUser` (cascade apaga todo o resto). |
| `cache-exercise-media` | Resolve e cacheia a mídia de um exercício (RapidAPI ou Free Exercise DB) no bucket `exercise-media`, com `service_role` — o cliente nunca mais escreve direto no Storage. Grava a URL final em `exercises.media_url` para não precisar resolver de novo nas próximas vezes. |

Deploy via MCP `mcp__supabase__deploy_edge_function` — código em `supabase/functions/<nome>/index.ts` (roda em Deno, por isso está fora do `tsconfig.json` do app).

> **A ordem importa entre 4 e 5.** O seed de planos referencia exercícios por `slug`;
> se o catálogo ampliado não estiver carregado, os exercícios faltantes são ignorados
> em silêncio e os dias ficam incompletos. A consulta de verificação está comentada
> no fim do arquivo `003`.

## Mídia dos exercícios

Os `free_db_id` foram validados contra o
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db) — o fallback final da
Edge Function `cache-exercise-media` monta a URL `.../exercises/{free_db_id}/0.jpg`.

Os `rapid_api_id` do seed inicial **não foram verificados** e ficam `null` nos exercícios
novos. A Camada 2 (RapidAPI/ExerciseDB) só é acionada se o secret `RAPIDAPI_KEY` estiver
configurado nas Edge Functions do projeto (Dashboard > Edge Functions > Manage secrets) —
**não é mais uma env var do app** (`EXPO_PUBLIC_RAPIDAPI_KEY` foi removida do cliente por
segurança). Antes de configurar, confira os IDs: um `rapid_api_id` errado baixa o GIF de
outro exercício e cacheia permanentemente.

## Segurança do bucket `exercise-media` — resolvido

A policy antiga de insert permitia que **qualquer usuário autenticado** escrevesse no
bucket público — corrigido removendo a policy (migration `003`) e movendo toda escrita
para a Edge Function `cache-exercise-media`, que usa `service_role` e nunca expõe essa
chave ao cliente. Leitura continua pública (bucket público de propósito — mídia
compartilhada entre todos os usuários, sem dado pessoal).
