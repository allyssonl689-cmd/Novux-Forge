-- ============================================================
-- 006_body_measurements.sql
-- Histórico de peso corporal (Fase I). `profiles.body_weight` continua
-- sendo o valor "atual" usado em exercícios de peso corporal e sugestão
-- de carga; esta tabela guarda a série ao longo do tempo para a tela de
-- Progresso. Uma entrada por dia (upsert em `logBodyMeasurement`).
-- ============================================================

create table public.body_measurements (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  weight_kg   numeric not null check (weight_kg > 0 and weight_kg < 400),
  measured_at date not null default current_date,
  created_at  timestamptz default now() not null,
  unique (user_id, measured_at)
);

comment on table public.body_measurements is 'Histórico de peso corporal do usuário — uma entrada por dia';

create index idx_body_measurements_user on public.body_measurements(user_id, measured_at desc);

alter table public.body_measurements enable row level security;

create policy "body_measurements: select próprio usuário"
  on public.body_measurements for select using (auth.uid() = user_id);

create policy "body_measurements: insert próprio usuário"
  on public.body_measurements for insert with check (auth.uid() = user_id);

create policy "body_measurements: update próprio usuário"
  on public.body_measurements for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "body_measurements: delete próprio usuário"
  on public.body_measurements for delete using (auth.uid() = user_id);
