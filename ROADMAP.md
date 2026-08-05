# Novux Forge — Pendências e Melhorias

> **Data:** 2026-07-31
> **Base:** auditoria do código atual do Forge cruzada com as práticas maduras de
> `C:\all\novux-finance` (web/backend) e `C:\all\novux-mobile` (Flutter).
> **Reposicionamento:** o `architecture_spec.md` define o público como "intermediários a
> avançados". O produto agora é **app auxiliar para iniciantes** — isso muda a prioridade:
> sugestão de treino pronta, orientação de execução e progressão guiada passam a ser o núcleo.

Prioridade: **[A]** alta · **[M]** média · **[B]** baixa.

---

## 0. Rebrand "Ember" — ✅ Fase R (2026-08-03)

Troca total da identidade: de "Neon Athletic" (cyan + Plus Jakarta Sans) para **Novux Ember**
(gradiente laranja `#FF6B2C` → magenta `#FF2D78`, fundo `#050816`), a partir dos tokens em
`brand/tokens/`.

- **Sistema de tema reativo** (light/dark comutável): `theme/palette.ts` (as duas paletas),
  `theme/themeStore.ts` (modo persistido em AsyncStorage), `useTheme()` retornando `colors`/
  `gradient`/`mode`/`toggle`. Todos os ~30 componentes/telas migraram de `import { colors }`
  estático para `const { colors } = useTheme(); const styles = useMemo(() => makeStyles(colors), [colors])`.
- **Fontes**: Poppins (UI), Syne (marca/`display`), Outfit (KPIs/números), Fira Code (mono).
  Instaladas via `@expo-google-fonts/*` (com `--legacy-peer-deps` por conflito pré-existente
  reanimated×worklets). `typography.ts` remapeado; papéis `metric`/`metricSmall`/`mono` novos.
- **Gradiente da marca**: `GradientButton` + ícone do card "treino de hoje" da Home.
  `expo-linear-gradient` instalado.
- **Ícone/splash**: assets copiados de `brand/logo/png` para `assets/images/`; `app.config.ts`
  com icon, adaptiveIcon, splash e `userInterfaceStyle: automatic`.
- **Toggle de tema** provisório no header da Home (sol/lua) — migra para Configurações na Fase F.
- Regra da marca respeitada: warning/danger em amarelo/vermelho dessaturado (separados por
  croma da faixa quente da marca); accent/gradient nunca em feedback.

**Verificação:** `tsc --noEmit` limpo, bundle Metro OK, sem resíduos de `PlusJakarta`/`colors`
estático. **Não testado em device.**

---

## 1. Bloqueadores — ✅ resolvidos na Fase A (2026-07-31)

| # | Problema | Situação |
|---|---|---|
| ~~[A]~~ | **Não existia criação/edição de ficha de treino.** | ✅ `workoutService` com CRUD completo + aba **Fichas** (lista, criação, editor com séries/reps/carga/descanso, reordenação, exclusão) |
| ~~[A]~~ | **Treino ativo iniciava vazio** (`startWorkout({ exercises: [] })`). | ✅ `active.tsx` carrega os exercícios reais da ficha e monta as séries a partir dos defaults |
| ~~[A]~~ | **"Próximo treino" da Home hardcoded.** | ✅ rotação real: a ficha treinada há mais tempo (nunca feitas primeiro) + banner de sessão em andamento |
| ~~[A]~~ | **Treino ativo só em memória.** | ✅ `persist` + AsyncStorage; cronômetro derivado de `startedAt` (reabrir o app não zera o tempo) |
| ~~[A]~~ | **`checkPersonalRecord` com `.single()`.** | ✅ `.maybeSingle()` + ignora séries de aquecimento; a checagem deixou de bloquear a UI |
| ~~[M]~~ | **`discardWorkout` não aguardava o delete.** | ✅ `async` com `await`, estado limpo antes da rede |
| ~~[M]~~ | **Logs pendentes viravam lixo no histórico.** | ✅ sessões pendentes (que nunca têm séries gravadas) são apagadas ao iniciar a próxima |
| ~~[M]~~ | Rota morta `app/(app)/workout/[id].tsx`. | ✅ removida (o detalhe real vive em `history/[id].tsx`) |
| ~~[M]~~ | **Catálogo com apenas 15 exercícios.** | ✅ Fase B: 69 exercícios, com panturrilha, glúteo, antebraço, core e peso corporal |

**Extras da Fase A:** `mediaResolver` estava quebrado no SDK 54 (`FileSystem.cacheDirectory` e
`EncodingType` não existem mais no `expo-file-system` 19) — o download agora vai direto para
memória via `fetch`/`arrayBuffer`. Script `npm run typecheck` adicionado (`tsc --noEmit` limpo)
e bundle Metro validado.

---

## 2. O núcleo pedido para iniciantes (não existe hoje)

### 2.1 Sugestão de treinos por grupo muscular e combinação diária — ✅ Fase B (2026-07-31)

Entregue: `training_splits` + `split_days` + `split_day_exercises` (migration `002`), tela de
planos com filtro por nível, detalhe com os dias expansíveis e **"Usar este plano"** clonando
para as fichas do usuário (`workouts.source_split_day_id` marca a origem).

6 planos no seed:

| Plano | Nível | Dias | Perfil |
|---|---|---|---|
| Corpo Inteiro 3x | Iniciante | 3 | Academia |
| Em Casa 3x | Iniciante | 3 | Sem equipamento |
| Superior / Inferior 4x | Iniciante | 4 | Academia |
| ABC clássico | Intermediário | 3 | Academia |
| ABCD | Intermediário | 4 | Academia |
| Push / Pull / Legs 6x | Avançado | 6 | Academia |

**Catálogo ampliado junto** (dependência da Fase B): 15 → **69 exercícios**, cobrindo
panturrilha, glúteo, antebraço, core e peso corporal. Todos os `free_db_id` foram
validados contra o Free Exercise DB — **6 dos 15 originais estavam quebrados** e foram
corrigidos. Restam 12 exercícios do catálogo ainda não usados por nenhum plano.

### 2.2 Wizard de onboarding que gera o plano — ✅ Fase C (2026-07-31)

5 passos (boas-vindas → objetivo → experiência → dias por semana → local de treino) com
preview da divisão recomendada e da semana montada. Ao concluir: cria as fichas, monta a
agenda e grava as respostas em `profiles` (`goal`, `experience_level`, `days_per_week`,
`equipment_profile`) — que depois viram contexto para o coach.

A recomendação vive em `src/features/plan/recommendation.ts`, **sem rede e sem estado**:

| Perfil | Divisão |
|---|---|
| Treina em casa (qualquer nível) | Em Casa 3x |
| Nunca treinou, até 3 dias | Corpo Inteiro 3x |
| Nunca treinou, 4+ dias | Superior / Inferior 4x |
| Menos de 1 ano, até 3 dias | ABC |
| Menos de 1 ano, 4+ dias | ABCD |
| Mais de 1 ano, 5-6 dias | Push/Pull/Legs |
| Mais de 1 ano, 4 dias | ABCD |
| Mais de 1 ano, até 3 dias | ABC |

Gate na Home: quem nunca completou o wizard **e** não tem nenhuma ficha é levado para ele.
Há botão "Pular" que marca `onboarding_completed_at` sem gravar respostas.

### 2.3 Plano semanal e "treino de hoje" — ✅ Fase C (2026-07-31)

- Tabela `weekly_plan` (migration `004`) com RLS por usuário; ausência de linha = descanso.
- Distribuição espaça os dias de folga (3x = seg/qua/sex, 4x = seg/ter/qui/sex, 5x =
  seg/ter/qua/sex/sáb) e **cicla as fichas** quando há mais dias que fichas — um ABC em 6
  dias vira A-B-C-A-B-C.
- Home mostra **o treino de hoje**, o estado de descanso (com o próximo treino e a opção
  "treinar mesmo assim") e uma faixa da semana clicável. Sem agenda, mantém a rotação por
  recência.
- Agenda editável em `workouts/schedule.tsx` — toque no dia para trocar a ficha ou marcar
  descanso.
- Aplicar um plano pela tela de planos também monta a agenda, **mas só se ela estiver vazia**
  (agenda existente é do usuário, não se sobrescreve).

### Fase G — Score + insights + volume por grupo — ✅ (2026-08-03)

Sem schema novo e sem lib de gráfico (barras via `View`). Tudo em `src/features/stats/`:
- **Score 0–1000** (`scoring.ts`, pura/testada): Consistência (0–400, treinos vs alvo do
  plano/perfil), Volume (0–200, séries de trabalho), Progressão (0–200, tendência de volume +
  PRs recentes), Equilíbrio (0–200, dispersão entre empurrar/puxar/pernas). Rótulo
  Crítico/Atenção/Bom/Excelente.
- **Insights com severidade + ação** (`insights.ts`, pura/testada): consistência, grupo
  negligenciado (10+ dias), desequilíbrio empurrar×puxar, PRs recentes, empty state.
- **`statsService.ts`**: agrega `workout_logs`→`exercise_logs`→`set_logs`→`exercises.muscle_group`
  em janela de 14 dias (mesmo padrão multi-query do `historyService` para evitar conflito de RLS).
- **UI**: `components/stats/ScoreRing.tsx` (medidor + breakdown), `app/(app)/progress.tsx` (score
  + volume por grupo dos últimos 7 dias em barras + orientações), card de score compacto na Home
  (aparece só com dados; leva à tela de Progresso).

Regra da marca respeitada: cor do score sempre pareada com número + rótulo textual.

### Fase F — Perfil + Configurações — 🟡 parcial (2026-08-03)

Entregue:
- **Perfil** (`app/(app)/profile.tsx`, aberto pelo avatar da Home): editar nome de exibição e
  **peso corporal** (`body_weight`); resumo do plano (objetivo/nível/dias/equipamento do onboarding).
  Serviço `src/features/profile/`.
- **Configurações** (`app/(app)/settings.tsx`): **tema Claro/Escuro/Sistema** (definitivo — o
  `useTheme` agora resolve 'system' via `useColorScheme`, default 'system'); **logout** (saiu da
  Home); **refazer onboarding** (zera `onboarding_completed_at`, sem apagar fichas).
- **Força de senha** no cadastro: checklist de 5 regras + barra/rótulo
  (`src/features/auth/passwordStrength.ts`, lógica pura testada; componente
  `src/components/auth/PasswordStrength.tsx`).
- **Esqueci minha senha** no login: `resetPasswordForEmail`. O reset em si acontece pelo link do
  e-mail (fluxo web) — **sem deep link no app ainda**.

Diferido (escolha do usuário): **unidade kg/lb** (cruza muitas telas), **excluir conta LGPD**
(exige Edge Function com service_role), **Termos/Privacidade**.

### 2.4 Execução prática de cada exercício — ✅ Fase D (2026-07-31)

Migration `005` adicionou `common_mistakes[]`, `setup_steps[]`, `breathing`, `tempo`,
`safety_notes` e `video_url`. Seed `004` preencheu os 69 exercícios:

- **Erros comuns** nos 69 (o item de maior valor para iniciante).
- **Respiração + cadência** nos 69 — por padrão de movimento, com exceções para levantamentos
  com pressão intra-abdominal (agachamento, terra) e isométricos (pranchas).
- **Ajustes antes de começar** em 20 exercícios de máquina/cabo (onde o iniciante mais trava).
- **Notas de segurança** em 13 exercícios de risco real (falha sob a barra, lombar no terra).
- **Vídeo**: `video_url` fica nulo; a tela abre uma **busca no YouTube** pelo nome do exercício
  (`{nome} execução correta`) — melhor que um link curado que quebra.
- **Alternativas**: `fetchExerciseAlternatives` sugere exercícios do mesmo grupo muscular,
  priorizando **equipamento diferente** ("o aparelho está ocupado"/"não tenho essa máquina").
  Sem coluna nova — deriva do catálogo.
- **Glossário** (`src/features/glossary/terms.ts`, 20 termos): conteúdo estático, offline,
  com termos relacionados navegáveis. Acessível pelo ícone `?` na lista e no detalhe do
  exercício. Cobre RPE, que era gravado sem nunca ser explicado.

Tela de detalhe reorganizada: mídia → vídeo → antes de começar → execução → respiração/cadência
→ erros comuns → dicas → segurança → alternativas → músculos secundários → glossário.

### 2.5 Progressão guiada — ✅ Fase E (2026-07-31)

`src/features/workouts/progression.ts` (lógica pura, testada por script):

- **Sugestão de carga inicial**: `seedWeight` semeia o peso da 1ª série com a última execução.
- **Sobrecarga progressiva**: se na última vez bateu o topo da faixa de reps, sugere `+1 / +2,5
  / +5 kg` conforme a magnitude da carga (halter leve sobe menos que barra pesada); senão,
  repete a carga anterior para consolidar. Marcado com "Carga sugerida acima da última".
- **Última execução no cabeçalho do exercício** ("Última vez: 40 kg × 10") — via
  `fetchLastPerformance`, a série de trabalho mais recente por exercício (RLS já filtra o usuário).

### 2.6 Timer de descanso — ✅ Fase E (2026-07-31)

`useRestTimer` + `RestTimerBar`: countdown automático ao concluir uma série (usa o
`rest_seconds` da ficha, que enfim é consumido), haptic pesado ao zerar, ajuste −15/+15s, botão
pular e barra de progresso. Não dispara na última série do exercício. Para ao finalizar/descartar.

---

## 3. Melhorias importadas do novux-finance e novux-mobile

### 3.1 Do **novux-mobile** (Flutter)

| Prática | Aplicação no Forge | Prio |
|---|---|---|
| `STATUS.md` + `GAP_ANALYSIS.md` versionados, com fases e commits | este `ROADMAP.md` + atualização a cada fase | [A] |
| 56 testes unitários (`dart analyze` limpo antes de cada commit) | Forge tem **zero testes** e nem `tsc --noEmit` no fluxo. Adicionar `vitest`/`jest` para lógica pura (`calcVolume`, PR, progressão, gerador de split) + script `typecheck` | [A] |
| Widgets de design system reutilizáveis (`shimmer_skeleton`, `pill_badge`, `novux_card`, `gradient_button`, `pulse_dot`) | Forge só tem `Button`, `Input`, `Badge`. Faltam `Skeleton` (loading real, hoje é texto "Carregando..."), `Card`, `EmptyState`, `ConfirmDialog` | [M] |
| `formatters.dart` centralizado | `src/lib/utils.ts` tem 17 linhas; centralizar kg/tempo/data pt-BR/volume | [M] |
| Força de senha com checklist de 5 regras + "esqueci minha senha" | ausente no `sign-up.tsx`/`sign-in.tsx` | [M] |
| Drawer para telas fora das abas | Forge não tem **Perfil** nem **Configurações** — o logout está escondido no avatar da Home | [A] |
| IA com contexto rico (21 campos) em vez de prompt seco | ver 3.3 | [M] |
| Onboarding de 5 passos com flag persistida | ver 2.2 | [A] |

### 3.2 Do **novux-finance** (web/backend)

| Prática | Aplicação no Forge | Prio |
|---|---|---|
| **Score 0–1000** + label (Excelente/Bom/Atenção/Crítico) | **Score de treino**: consistência (treinos/semana planejados vs feitos), volume, progressão de carga e equilíbrio muscular | [M] |
| **Insights automáticos com severidade** (critical/warning/positive/info) + "ação recomendada" | "Você treinou peito 3× e costas 1× nas últimas 2 semanas — risco de desequilíbrio postural" | [M] |
| **SmartIndicators** (tendência, projeção, top-3 vilões) | Volume semanal por grupo muscular, série/semana vs faixa recomendada (10–20), grupos negligenciados | [M] |
| Export CSV/JSON + LGPD (excluir conta em 2 passos, termos, privacidade) | ausente — necessário antes de publicar nas lojas | [M] |
| Verificação de e-mail, 2FA, rate limiting, audit log | Supabase Auth já entrega verificação de e-mail e rate limit; **ativar** e tratar no app | [M] |
| `ErrorBoundary`, `ConfirmDialog`, `EmptyDashboard` | Forge usa `Alert.alert` cru e não tem error boundary | [M] |
| Importação CSV com preview | importar histórico de outro app (Hevy/Strong) — retenção na migração | [B] |
| Gates Free vs Premium + `UpgradeModal` | monetização futura: IA coach e planos avançados como premium | [B] |
| Skills `.claude/skills/Ciber_Security_Agent` e `.agents/skills/supabase-postgres-best-practices` | copiar para o Forge — revisão de RLS e schema com o mesmo padrão | [M] |

### 3.3 Coach IA (opcional, alto impacto para iniciante) **[M]**

O finance usa Groq LLaMA 3.3 70B; o mobile monta um `AiContextBuilder` com 21 campos antes de
chamar o chat. Equivalente aqui: **Coach Forge** com contexto de treino —
últimos 30 dias de sessões, volume por grupo, PRs, aderência ao plano, lesões/limitações
declaradas — respondendo "meu ombro dói no supino, o que faço?" ou "posso treinar hoje de novo?".
Chamada via **Supabase Edge Function** (nunca com a chave da LLM no cliente).

---

## 4. Débitos técnicos e riscos

### Achados do linter de segurança do Supabase — ✅ corrigidos (migration `003`)

Todos eram **pré-existentes**; as tabelas da Fase B passaram limpas. Depois da correção o
linter só aponta o item de configuração do painel.

- ~~**[A] `handle_new_user` chamável por qualquer um**~~ via `POST /rest/v1/rpc/handle_new_user`,
  como `SECURITY DEFINER` com `search_path` mutável. ✅ `EXECUTE` revogado de `public`/`anon`/
  `authenticated`, `search_path = ''`, grant explícito para `supabase_auth_admin`. **Testado**:
  inserção em `auth.users` continua criando o `profile` com o `display_name` correto.
- ~~**[A] `rls_auto_enable` exposta**~~ — é o event trigger `ensure_rls` da plataforma, que
  habilita RLS em toda tabela nova do schema `public`. Guard-rail legítimo: mantido, só deixou
  de ser chamável pela API.
- ~~**[M] Bucket `exercise-media` permitia listar todos os arquivos**~~ ✅ policy de SELECT
  removida (bucket público serve objetos por URL sem ela).
- ~~**[M] Escrita no bucket liberada para qualquer autenticado**~~ ✅ policy de INSERT removida.
  Consequência: o `mediaResolver` não cacheia mais no Storage — passou a devolver o GIF da CDN
  direto (`expo-image` cuida do cache local). O cache permanente volta quando o upload virar
  Edge Function.
- **[M] Proteção contra senha vazada** (HaveIBeenPwned) segue desativada — é um toggle em
  *Authentication → Policies* no painel, não dá para fazer por SQL.

### Outros

- **RLS de `storage.objects`**: a policy de insert em `exercise-media` permite que **qualquer
  usuário autenticado** grave no bucket público (`activeWorkoutStore` não, mas o `mediaResolver`
  faz upload direto do cliente). Um usuário mal-intencionado pode sobrescrever GIFs de todos.
  → mover o cache do RapidAPI para uma **Edge Function** com `service_role`.
- **`mediaResolver` faz 2 requisições HEAD por exercício** antes de decidir a fonte — em lista
  isso multiplica. Persistir a fonte resolvida em `exercises.media_source` após a 1ª vez.
- **Sem tratamento de offline** — academia costuma ter sinal ruim. Fila local de séries + sync.
- **Sem `tsconfig` no CI, sem lint, sem testes** — nenhuma barreira antes do commit.
- **Sem tela de perfil** — `profiles.body_weight` existe no schema e nunca é preenchido, embora
  seja necessário para exercícios de peso corporal e sugestão de carga.
- `package.json` tem dependências estranhas ao projeto: `ansi-escapes` e `promise`.

---

## 5. Ordem sugerida (valor × esforço)

| Fase | Entrega | Por quê |
|---|---|---|
| ✅ **A** | **Fichas de treino (CRUD) + treino ativo carregando os exercícios reais** + correção dos bugs do store + persistência local do treino ativo | Destrava o ciclo principal — concluída em 2026-07-31 |
| ✅ **B** | **Catálogo de splits + templates oficiais** (Full Body / Em Casa / Upper-Lower / ABC / ABCD / PPL) + "Usar este plano" + catálogo com 69 exercícios | Concluída em 2026-07-31 — **já aplicada no Supabase** (69 exercícios, 6 planos, 23 dias, 131 prescrições) |
| ✅ **C** | **Onboarding wizard** (objetivo/nível/dias/equipamento → gera as fichas) + **plano semanal** + Home com "treino de hoje" | Concluída em 2026-07-31 — migration `004` já aplicada no Supabase |
| ✅ **D** | **Execução prática**: `common_mistakes`, vídeo, cadência/respiração, alternativas, glossário | Concluída em 2026-07-31 — migration `005` + seed `004` já aplicados no Supabase |
| ✅ **E** | **Timer de descanso**, última execução no exercício, sugestão de progressão de carga | Concluída em 2026-07-31 — sem mudança de schema (`rest_seconds` já existia) |
| ✅ **R** | **Rebrand "Ember"** — nova identidade Novux (cores laranja→magenta, fontes, gradiente, ícone/splash) + tema light/dark comutável | Concluída em 2026-08-03 |
| 🟡 **F** | **Perfil + Configurações** (peso corporal, tema, logout, refazer onboarding) + força de senha + esqueci senha | Concluída em 2026-08-03 (parcial — ver abaixo). Diferidos: unidade kg/lb, excluir conta (LGPD), termos/privacidade |
| ✅ **G** | **Score de treino + insights + volume semanal por grupo** | Concluída em 2026-08-03 — sem schema novo nem lib de gráfico |
| **H** | Testes + typecheck + `Skeleton`/`EmptyState`/`ErrorBoundary` + Edge Function do cache de mídia | Sustentação |
| **I** | Coach IA, importação CSV, gates premium | Expansão |
