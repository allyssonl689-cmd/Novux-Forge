-- ============================================================
-- 001_initial_schema.sql
-- Executar via: supabase db push
-- ============================================================

create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,
  body_weight   numeric(5,2),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

comment on table public.profiles is 'Perfil público estendido do usuário';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- EXERCISES
create table public.exercises (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,
  muscle_group    text not null,
  muscles_worked  text[] default '{}',
  equipment       text not null,
  category        text not null,
  difficulty      text default 'intermediate',
  instructions    text[] default '{}',
  tips            text[] default '{}',
  is_public       boolean default true,
  created_by      uuid references auth.users(id),
  free_db_id      text,
  rapid_api_id    text,
  created_at      timestamptz default now() not null
);

comment on table public.exercises is 'Catálogo de exercícios — públicos e criados por usuários';
comment on column public.exercises.free_db_id is 'ID no Free Exercise DB (github: yuhonas/free-exercise-db) — usado como fallback de mídia';
comment on column public.exercises.rapid_api_id is 'ID no ExerciseDB (RapidAPI) — usado para buscar GIF animado sob demanda com cache no Storage';

-- WORKOUTS
create table public.workouts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  category    text,
  is_active   boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- WORKOUT_EXERCISES
create table public.workout_exercises (
  id                uuid primary key default uuid_generate_v4(),
  workout_id        uuid not null references public.workouts(id) on delete cascade,
  exercise_id       uuid not null references public.exercises(id),
  sort_order        integer default 0,
  default_sets      integer default 3,
  default_reps      integer default 10,
  default_weight_kg numeric(6,2),
  rest_seconds      integer default 90,
  notes             text,
  created_at        timestamptz default now() not null
);

-- WORKOUT_LOGS
create table public.workout_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  workout_id    uuid references public.workouts(id) on delete set null,
  name          text not null,
  started_at    timestamptz not null,
  finished_at   timestamptz,
  duration_secs integer,
  total_volume_kg numeric(10,2) default 0,
  notes         text,
  created_at    timestamptz default now() not null
);

-- EXERCISE_LOGS
create table public.exercise_logs (
  id             uuid primary key default uuid_generate_v4(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id    uuid not null references public.exercises(id),
  exercise_name  text not null,
  sort_order     integer default 0,
  notes          text,
  created_at     timestamptz default now() not null
);

-- SET_LOGS
create table public.set_logs (
  id               uuid primary key default uuid_generate_v4(),
  exercise_log_id  uuid not null references public.exercise_logs(id) on delete cascade,
  set_number       integer not null,
  weight_kg        numeric(6,2),
  reps             integer,
  duration_secs    integer,
  rpe              numeric(3,1),
  is_warmup        boolean default false,
  is_personal_record boolean default false,
  completed_at     timestamptz default now() not null
);

-- ÍNDICES
create index idx_workouts_user_id         on public.workouts(user_id);
create index idx_workout_exercises_wid    on public.workout_exercises(workout_id);
create index idx_workout_logs_user_id     on public.workout_logs(user_id);
create index idx_workout_logs_started_at  on public.workout_logs(started_at desc);
create index idx_exercise_logs_wlog_id    on public.exercise_logs(workout_log_id);
create index idx_set_logs_exlog_id        on public.set_logs(exercise_log_id);
create index idx_exercises_muscle_group   on public.exercises(muscle_group);
create index idx_exercises_is_public      on public.exercises(is_public);

-- RLS
alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_logs      enable row level security;
alter table public.exercise_logs     enable row level security;
alter table public.set_logs          enable row level security;

create policy "profiles: usuário vê o próprio perfil"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles: usuário edita o próprio perfil"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "exercises: leitura pública para autenticados"
  on public.exercises for select
  using (auth.role() = 'authenticated' and (is_public = true or created_by = auth.uid()));

create policy "exercises: insert pelo próprio usuário"
  on public.exercises for insert with check (auth.uid() = created_by);

create policy "exercises: update pelo criador"
  on public.exercises for update using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "exercises: delete pelo criador"
  on public.exercises for delete using (auth.uid() = created_by);

create policy "workouts: select próprio usuário"
  on public.workouts for select using (auth.uid() = user_id);

create policy "workouts: insert próprio usuário"
  on public.workouts for insert with check (auth.uid() = user_id);

create policy "workouts: update próprio usuário"
  on public.workouts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workouts: delete próprio usuário"
  on public.workouts for delete using (auth.uid() = user_id);

create policy "workout_exercises: acesso via workout do usuário"
  on public.workout_exercises for all
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

create policy "workout_logs: select próprio usuário"
  on public.workout_logs for select using (auth.uid() = user_id);

create policy "workout_logs: insert próprio usuário"
  on public.workout_logs for insert with check (auth.uid() = user_id);

create policy "workout_logs: update próprio usuário"
  on public.workout_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_logs: delete próprio usuário"
  on public.workout_logs for delete using (auth.uid() = user_id);

create policy "exercise_logs: acesso via workout_log do usuário"
  on public.exercise_logs for all
  using (exists (select 1 from public.workout_logs wl where wl.id = workout_log_id and wl.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_logs wl where wl.id = workout_log_id and wl.user_id = auth.uid()));

create policy "set_logs: acesso via exercise_log do usuário"
  on public.set_logs for all
  using (exists (
    select 1 from public.exercise_logs el
    join public.workout_logs wl on wl.id = el.workout_log_id
    where el.id = exercise_log_id and wl.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.exercise_logs el
    join public.workout_logs wl on wl.id = el.workout_log_id
    where el.id = exercise_log_id and wl.user_id = auth.uid()
  ));

-- Storage bucket exercise-media
insert into storage.buckets (id, name, public) values ('exercise-media', 'exercise-media', true);

create policy "exercise-media: leitura pública"
  on storage.objects for select using (bucket_id = 'exercise-media');

create policy "exercise-media: insert para cache"
  on storage.objects for insert
  with check (bucket_id = 'exercise-media' and auth.role() = 'authenticated');
