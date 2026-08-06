-- ============================================================
-- 008_progress_photos.sql
-- Foto de progresso junto com a pesagem (complementa a Fase I). Bucket
-- PRIVADO (diferente do exercise-media, que é público de propósito) —
-- fotos do corpo do usuário não têm por que ser legíveis por qualquer
-- um. Convenção de path: `{user_id}/{measurement_id}.jpg`; a policy
-- usa o primeiro segmento do path para restringir cada usuário à sua
-- própria pasta.
-- ============================================================

alter table public.body_measurements
  add column if not exists photo_path text;

comment on column public.body_measurements.photo_path is
  'Path no bucket privado progress-photos — {user_id}/{measurement_id}.jpg';

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false);

create policy "progress-photos: select próprio usuário"
  on storage.objects for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress-photos: insert próprio usuário"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress-photos: update próprio usuário"
  on storage.objects for update
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress-photos: delete próprio usuário"
  on storage.objects for delete
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
