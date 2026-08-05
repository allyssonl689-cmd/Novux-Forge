-- ============================================================
-- 002_training_splits.sql
-- Planos de treino sugeridos (divisões prontas por grupo muscular
-- e combinação diária). Catálogo oficial, somente leitura no app —
-- o usuário clona o plano para as próprias fichas.
-- ============================================================

-- ── TABELA: training_splits ─────────────────────────────────
create table public.training_splits (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,          -- ex: "abc-3x"
  name          text not null,                 -- ex: "ABC clássico"
  subtitle      text,                          -- ex: "Peito/Ombro · Costas/Bíceps · Pernas"
  description   text,
  goal          text not null,                 -- hipertrofia | forca | emagrecimento | condicionamento
  level         text not null default 'beginner', -- beginner | intermediate | advanced
  days_per_week integer not null,
  equipment_profile text not null default 'gym', -- gym | home | dumbbells
  sort_order    integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now() not null
);

comment on table public.training_splits is 'Divisões de treino oficiais sugeridas pelo app';
comment on column public.training_splits.equipment_profile is 'gym = academia completa, dumbbells = halteres, home = sem equipamento';

-- ── TABELA: split_days ──────────────────────────────────────
create table public.split_days (
  id        uuid primary key default uuid_generate_v4(),
  split_id  uuid not null references public.training_splits(id) on delete cascade,
  day_index integer not null,                  -- 0, 1, 2…
  label     text not null,                     -- "A", "B", "Superior"
  name      text not null,                     -- "Peito, Ombro e Tríceps"
  focus     text[] default '{}',               -- grupos musculares do dia
  created_at timestamptz default now() not null,
  unique (split_id, day_index)
);

comment on table public.split_days is 'Cada dia de uma divisão — é o que vira uma ficha ao clonar';

-- ── TABELA: split_day_exercises ─────────────────────────────
create table public.split_day_exercises (
  id            uuid primary key default uuid_generate_v4(),
  split_day_id  uuid not null references public.split_days(id) on delete cascade,
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  sort_order    integer default 0,
  sets          integer not null default 3,
  reps          integer not null default 10,   -- alvo; em isométricos representa segundos
  rep_range     text,                          -- rótulo exibido: "8-12", "30-45s"
  rest_seconds  integer not null default 90,
  is_time_based boolean default false,         -- true = reps significa segundos
  notes         text,
  created_at    timestamptz default now() not null,
  unique (split_day_id, exercise_id)
);

comment on table public.split_day_exercises is 'Exercícios sugeridos em cada dia da divisão';

-- ── ÍNDICES ─────────────────────────────────────────────────
create index idx_split_days_split_id       on public.split_days(split_id);
create index idx_split_day_ex_day_id       on public.split_day_exercises(split_day_id);
create index idx_training_splits_active    on public.training_splits(is_active);

-- ── RLS ─────────────────────────────────────────────────────
-- Catálogo oficial: leitura para autenticados, escrita só via service_role
-- (que ignora RLS). Nenhuma policy de insert/update/delete é criada.
alter table public.training_splits     enable row level security;
alter table public.split_days          enable row level security;
alter table public.split_day_exercises enable row level security;

create policy "training_splits: leitura para autenticados"
  on public.training_splits for select
  using (auth.role() = 'authenticated');

create policy "split_days: leitura para autenticados"
  on public.split_days for select
  using (auth.role() = 'authenticated');

create policy "split_day_exercises: leitura para autenticados"
  on public.split_day_exercises for select
  using (auth.role() = 'authenticated');

-- ── Origem da ficha ─────────────────────────────────────────
-- Permite mostrar "criada a partir do plano X" e evitar clonar o mesmo dia duas vezes.
alter table public.workouts
  add column if not exists source_split_day_id uuid references public.split_days(id) on delete set null;

create index if not exists idx_workouts_source_split_day on public.workouts(source_split_day_id);
