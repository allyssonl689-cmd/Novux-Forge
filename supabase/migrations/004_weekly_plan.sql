-- ============================================================
-- 004_weekly_plan.sql
-- Plano semanal (qual ficha em cada dia da semana) e respostas do
-- onboarding, usadas para recomendar a divisão e, mais tarde, para
-- dar contexto ao coach.
-- ============================================================

-- ── Respostas do onboarding no profile ──────────────────────
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists goal              text,   -- hipertrofia | forca | emagrecimento | condicionamento
  add column if not exists experience_level  text,   -- never | under_year | over_year
  add column if not exists days_per_week     integer,
  add column if not exists equipment_profile text;   -- gym | home

comment on column public.profiles.onboarding_completed_at is 'null = usuário ainda não passou pelo wizard inicial';

-- ── TABELA: weekly_plan ─────────────────────────────────────
-- Ausência de linha para um dia significa descanso.
create table public.weekly_plan (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6),  -- 0 = domingo
  workout_id uuid not null references public.workouts(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique (user_id, weekday)
);

comment on table public.weekly_plan is 'Agenda semanal: qual ficha treinar em cada dia da semana';
comment on column public.weekly_plan.weekday is '0 = domingo … 6 = sábado (mesma convenção de Date.getDay())';

create index idx_weekly_plan_user on public.weekly_plan(user_id);

alter table public.weekly_plan enable row level security;

create policy "weekly_plan: select próprio usuário"
  on public.weekly_plan for select using (auth.uid() = user_id);

create policy "weekly_plan: insert próprio usuário"
  on public.weekly_plan for insert with check (auth.uid() = user_id);

create policy "weekly_plan: update próprio usuário"
  on public.weekly_plan for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weekly_plan: delete próprio usuário"
  on public.weekly_plan for delete using (auth.uid() = user_id);
