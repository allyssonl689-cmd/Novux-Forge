-- ============================================================
-- 003_training_splits_seed.sql
-- Planos de treino sugeridos, por nível e dias disponíveis.
-- Requer: 002_training_splits.sql (schema) e 002_exercises_expansion.sql (catálogo).
-- Idempotente.
-- ============================================================

-- ── 1. Divisões ─────────────────────────────────────────────

insert into public.training_splits
  (slug, name, subtitle, description, goal, level, days_per_week, equipment_profile, sort_order)
values
  ('full-body-3x', 'Corpo Inteiro 3x',
   'Todos os grupos musculares em cada treino',
   'A melhor divisão para quem está começando: cada músculo é treinado 3 vezes por semana com pouco volume por sessão, o que acelera o aprendizado dos movimentos e reduz a dor muscular. Treine em dias alternados (ex.: segunda, quarta e sexta).',
   'hipertrofia', 'beginner', 3, 'gym', 0),

  ('casa-3x', 'Em Casa 3x',
   'Sem equipamento, usando o peso do corpo',
   'Para treinar em casa ou viajando. Usa apenas o peso corporal e mantém o corpo inteiro ativo três vezes por semana. Bom ponto de partida antes de entrar na academia.',
   'condicionamento', 'beginner', 3, 'home', 1),

  ('upper-lower-4x', 'Superior / Inferior 4x',
   'Dois dias de tronco e dois de pernas',
   'Passo natural depois do corpo inteiro. Divide a semana entre membros superiores e inferiores, permitindo mais exercícios por grupo sem sessões longas demais. Ex.: segunda, terça, quinta e sexta.',
   'hipertrofia', 'beginner', 4, 'gym', 2),

  ('abc-3x', 'ABC clássico',
   'Peito/Ombro/Tríceps · Costas/Bíceps · Pernas',
   'A divisão mais popular das academias brasileiras. Agrupa músculos que trabalham juntos, dando volume suficiente para quem já tem alguns meses de treino. Pode ser feita 3 ou 6 vezes por semana (ABC ou ABCABC).',
   'hipertrofia', 'intermediate', 3, 'gym', 3),

  ('abcd-4x', 'ABCD',
   'Peito/Tríceps · Costas/Bíceps · Pernas · Ombro/Core',
   'Separa o ombro em um dia próprio, o que permite mais volume para os deltoides e recuperação melhor entre os treinos de empurrar. Indicada para quem treina 4 dias por semana com consistência.',
   'hipertrofia', 'intermediate', 4, 'gym', 4),

  ('ppl-6x', 'Push / Pull / Legs 6x',
   'Empurrar · Puxar · Pernas, duas vezes por semana',
   'Divisão de alto volume para quem já treina há mais de um ano e consegue ir à academia 6 dias por semana. Cada grupo é treinado duas vezes por semana, com variação de exercícios entre as sessões A e B.',
   'hipertrofia', 'advanced', 6, 'gym', 5)
on conflict (slug) do nothing;

-- ── 2. Dias de cada divisão ─────────────────────────────────

insert into public.split_days (split_id, day_index, label, name, focus)
select s.id, v.day_index, v.label, v.name, v.focus
from (values
  -- Corpo Inteiro 3x
  ('full-body-3x', 0, 'A', 'Corpo inteiro A', ARRAY['Quadríceps','Peito','Costas','Ombro','Core']::text[]),
  ('full-body-3x', 1, 'B', 'Corpo inteiro B', ARRAY['Quadríceps','Peito','Costas','Ombro','Core']::text[]),
  ('full-body-3x', 2, 'C', 'Corpo inteiro C', ARRAY['Quadríceps','Peito','Costas','Isquiotibiais','Panturrilha']::text[]),

  -- Em Casa 3x
  ('casa-3x', 0, 'A', 'Pernas e core', ARRAY['Quadríceps','Glúteos','Core']::text[]),
  ('casa-3x', 1, 'B', 'Tronco e abdômen', ARRAY['Peito','Tríceps','Core']::text[]),
  ('casa-3x', 2, 'C', 'Corpo inteiro', ARRAY['Peito','Glúteos','Core']::text[]),

  -- Superior / Inferior 4x
  ('upper-lower-4x', 0, 'Superior A', 'Tronco — força', ARRAY['Peito','Costas','Ombro','Bíceps','Tríceps']::text[]),
  ('upper-lower-4x', 1, 'Inferior A', 'Pernas — força', ARRAY['Quadríceps','Isquiotibiais','Panturrilha','Core']::text[]),
  ('upper-lower-4x', 2, 'Superior B', 'Tronco — volume', ARRAY['Peito','Costas','Ombro','Bíceps','Tríceps']::text[]),
  ('upper-lower-4x', 3, 'Inferior B', 'Pernas — volume', ARRAY['Quadríceps','Glúteos','Isquiotibiais','Panturrilha']::text[]),

  -- ABC
  ('abc-3x', 0, 'A', 'Peito, Ombro e Tríceps', ARRAY['Peito','Ombro','Tríceps']::text[]),
  ('abc-3x', 1, 'B', 'Costas e Bíceps', ARRAY['Costas','Bíceps']::text[]),
  ('abc-3x', 2, 'C', 'Pernas e Core', ARRAY['Quadríceps','Isquiotibiais','Panturrilha','Core']::text[]),

  -- ABCD
  ('abcd-4x', 0, 'A', 'Peito e Tríceps', ARRAY['Peito','Tríceps']::text[]),
  ('abcd-4x', 1, 'B', 'Costas e Bíceps', ARRAY['Costas','Bíceps']::text[]),
  ('abcd-4x', 2, 'C', 'Pernas', ARRAY['Quadríceps','Isquiotibiais','Panturrilha']::text[]),
  ('abcd-4x', 3, 'D', 'Ombro e Core', ARRAY['Ombro','Trapézio','Core']::text[]),

  -- Push / Pull / Legs
  ('ppl-6x', 0, 'Push A', 'Empurrar — força', ARRAY['Peito','Ombro','Tríceps']::text[]),
  ('ppl-6x', 1, 'Pull A', 'Puxar — força', ARRAY['Costas','Bíceps']::text[]),
  ('ppl-6x', 2, 'Legs A', 'Pernas — força', ARRAY['Quadríceps','Isquiotibiais','Panturrilha']::text[]),
  ('ppl-6x', 3, 'Push B', 'Empurrar — volume', ARRAY['Peito','Ombro','Tríceps']::text[]),
  ('ppl-6x', 4, 'Pull B', 'Puxar — volume', ARRAY['Costas','Bíceps']::text[]),
  ('ppl-6x', 5, 'Legs B', 'Pernas — volume', ARRAY['Isquiotibiais','Glúteos','Quadríceps','Panturrilha']::text[])
) as v(split_slug, day_index, label, name, focus)
join public.training_splits s on s.slug = v.split_slug
on conflict (split_id, day_index) do nothing;

-- ── 3. Exercícios de cada dia ───────────────────────────────

insert into public.split_day_exercises
  (split_day_id, exercise_id, sort_order, sets, reps, rep_range, rest_seconds, is_time_based)
select d.id, e.id, v.sort_order, v.sets, v.reps, v.rep_range, v.rest_seconds, v.is_time_based
from (values
  -- ══ CORPO INTEIRO 3x ═══════════════════════════════════════
  ('full-body-3x', 0, 'agachamento-goblet',      0, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 0, 'supino-reto-maquina',     1, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 0, 'puxada-frontal-maquina',  2, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 0, 'desenvolvimento-halteres',3, 3, 12, '10-12', 75,  false),
  ('full-body-3x', 0, 'prancha-abdominal',       4, 3, 30, '30-45s', 60, true),

  ('full-body-3x', 1, 'leg-press-45',            0, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 1, 'supino-inclinado-halteres',1,3, 12, '10-12', 90,  false),
  ('full-body-3x', 1, 'remada-baixa-cabo',       2, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 1, 'elevacao-lateral-halteres',3,3, 15, '12-15', 60,  false),
  ('full-body-3x', 1, 'abdominal-supra',         4, 3, 15, '15-20', 45,  false),

  ('full-body-3x', 2, 'agachamento-smith',       0, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 2, 'flexao-de-braco',         1, 3, 10, 'até a falha', 75, false),
  ('full-body-3x', 2, 'puxada-triangulo',        2, 3, 12, '10-12', 90,  false),
  ('full-body-3x', 2, 'mesa-flexora',            3, 3, 12, '10-12', 75,  false),
  ('full-body-3x', 2, 'panturrilha-em-pe',       4, 3, 15, '15-20', 45,  false),

  -- ══ EM CASA 3x ═════════════════════════════════════════════
  ('casa-3x', 0, 'agachamento-peso-corporal', 0, 3, 15, '15-20', 60, false),
  ('casa-3x', 0, 'ponte-gluteo',              1, 3, 15, '15-20', 60, false),
  ('casa-3x', 0, 'escalador',                 2, 3, 30, '30s',   45, true),
  ('casa-3x', 0, 'prancha-abdominal',         3, 3, 40, '30-45s',60, true),

  ('casa-3x', 1, 'flexao-de-braco',      0, 3, 10, 'até a falha', 75, false),
  ('casa-3x', 1, 'triceps-banco',        1, 3, 12, '10-15', 60, false),
  ('casa-3x', 1, 'abdominal-bicicleta',  2, 3, 20, '20 total', 45, false),
  ('casa-3x', 1, 'rotacao-russa',        3, 3, 20, '20 total', 45, false),
  ('casa-3x', 1, 'prancha-lateral',      4, 3, 30, '30s cada lado', 45, true),

  ('casa-3x', 2, 'agachamento-peso-corporal', 0, 4, 20, '20',   60, false),
  ('casa-3x', 2, 'flexao-de-braco',           1, 4, 8,  'até a falha', 75, false),
  ('casa-3x', 2, 'ponte-gluteo',              2, 3, 20, '20',   45, false),
  ('casa-3x', 2, 'escalador',                 3, 3, 30, '30s',  45, true),
  ('casa-3x', 2, 'abdominal-supra',           4, 3, 20, '20',   45, false),

  -- ══ SUPERIOR / INFERIOR 4x ═════════════════════════════════
  ('upper-lower-4x', 0, 'supino-reto-barra',      0, 4, 10, '8-10',  120, false),
  ('upper-lower-4x', 0, 'remada-curvada-barra',   1, 4, 10, '8-10',  120, false),
  ('upper-lower-4x', 0, 'desenvolvimento-halteres',2,3, 12, '10-12', 90,  false),
  ('upper-lower-4x', 0, 'puxada-frontal-maquina', 3, 3, 12, '10-12', 90,  false),
  ('upper-lower-4x', 0, 'rosca-direta-barra',     4, 3, 12, '10-12', 60,  false),
  ('upper-lower-4x', 0, 'triceps-corda-polia',    5, 3, 12, '10-12', 60,  false),

  ('upper-lower-4x', 1, 'agachamento-livre-barra',0, 4, 8,  '6-8',   150, false),
  ('upper-lower-4x', 1, 'terra-romeno',           1, 3, 10, '8-10',  120, false),
  ('upper-lower-4x', 1, 'leg-press-45',           2, 3, 12, '10-12', 90,  false),
  ('upper-lower-4x', 1, 'mesa-flexora',           3, 3, 12, '10-12', 75,  false),
  ('upper-lower-4x', 1, 'panturrilha-em-pe',      4, 4, 15, '15-20', 45,  false),
  ('upper-lower-4x', 1, 'prancha-abdominal',      5, 3, 40, '40-60s',60,  true),

  ('upper-lower-4x', 2, 'supino-inclinado-halteres',0,4, 10, '8-12', 105, false),
  ('upper-lower-4x', 2, 'barra-fixa-supinada',      1,3, 8,  'até a falha', 120, false),
  ('upper-lower-4x', 2, 'remada-unilateral-halter', 2,3, 12, '10-12 cada lado', 75, false),
  ('upper-lower-4x', 2, 'elevacao-lateral-halteres',3,3, 15, '12-15', 60, false),
  ('upper-lower-4x', 2, 'rosca-martelo',            4,3, 12, '10-12', 60, false),
  ('upper-lower-4x', 2, 'triceps-frances-halter',   5,3, 12, '10-12', 60, false),

  ('upper-lower-4x', 3, 'agachamento-hack',    0, 4, 10, '8-12',  120, false),
  ('upper-lower-4x', 3, 'elevacao-pelvica',    1, 3, 12, '10-12', 90,  false),
  ('upper-lower-4x', 3, 'cadeira-extensora',   2, 3, 15, '12-15', 60,  false),
  ('upper-lower-4x', 3, 'cadeira-flexora',     3, 3, 12, '10-12', 60,  false),
  ('upper-lower-4x', 3, 'panturrilha-sentado', 4, 4, 15, '15-20', 45,  false),
  ('upper-lower-4x', 3, 'abdominal-supra',     5, 3, 15, '15-20', 45,  false),

  -- ══ ABC ════════════════════════════════════════════════════
  ('abc-3x', 0, 'supino-reto-barra',        0, 4, 10, '8-10',  120, false),
  ('abc-3x', 0, 'supino-inclinado-halteres',1, 3, 10, '10-12', 90,  false),
  ('abc-3x', 0, 'crucifixo-halteres',       2, 3, 12, '12-15', 60,  false),
  ('abc-3x', 0, 'desenvolvimento-militar-barra',3,3,10,'8-10', 90,  false),
  ('abc-3x', 0, 'elevacao-lateral-halteres',4, 3, 15, '12-15', 60,  false),
  ('abc-3x', 0, 'triceps-testa-barra-ez',   5, 3, 10, '10-12', 60,  false),
  ('abc-3x', 0, 'triceps-corda-polia',      6, 3, 12, '12-15', 60,  false),

  ('abc-3x', 1, 'puxada-frontal-maquina', 0, 4, 10, '10-12', 90,  false),
  ('abc-3x', 1, 'remada-curvada-barra',   1, 4, 10, '8-10',  120, false),
  ('abc-3x', 1, 'remada-baixa-cabo',      2, 3, 12, '10-12', 90,  false),
  ('abc-3x', 1, 'pullover-polia',         3, 3, 12, '12-15', 60,  false),
  ('abc-3x', 1, 'rosca-direta-barra',     4, 3, 10, '8-10',  75,  false),
  ('abc-3x', 1, 'rosca-martelo',          5, 3, 12, '10-12', 60,  false),
  ('abc-3x', 1, 'rosca-concentrada',      6, 3, 12, '12-15', 45,  false),

  ('abc-3x', 2, 'agachamento-livre-barra',0, 4, 8,  '6-8',   150, false),
  ('abc-3x', 2, 'leg-press-45',           1, 3, 12, '10-12', 90,  false),
  ('abc-3x', 2, 'cadeira-extensora',      2, 3, 15, '12-15', 60,  false),
  ('abc-3x', 2, 'mesa-flexora',           3, 3, 12, '10-12', 75,  false),
  ('abc-3x', 2, 'stiff-halteres',         4, 3, 12, '10-12', 75,  false),
  ('abc-3x', 2, 'panturrilha-em-pe',      5, 4, 15, '15-20', 45,  false),
  ('abc-3x', 2, 'abdominal-supra',        6, 3, 20, '15-20', 45,  false),

  -- ══ ABCD ═══════════════════════════════════════════════════
  ('abcd-4x', 0, 'supino-reto-barra',        0, 4, 8,  '6-8',   120, false),
  ('abcd-4x', 0, 'supino-inclinado-halteres',1, 3, 10, '8-12',  90,  false),
  ('abcd-4x', 0, 'crossover-polia',          2, 3, 12, '12-15', 60,  false),
  ('abcd-4x', 0, 'triceps-corda-polia',      3, 3, 12, '10-12', 60,  false),
  ('abcd-4x', 0, 'triceps-banco',            4, 3, 12, 'até a falha', 60, false),

  ('abcd-4x', 1, 'barra-fixa-supinada',   0, 3, 8,  'até a falha', 120, false),
  ('abcd-4x', 1, 'remada-curvada-barra',  1, 4, 10, '8-10',  120, false),
  ('abcd-4x', 1, 'puxada-triangulo',      2, 3, 12, '10-12', 90,  false),
  ('abcd-4x', 1, 'rosca-direta-barra',    3, 3, 10, '8-10',  75,  false),
  ('abcd-4x', 1, 'rosca-scott-maquina',   4, 3, 12, '10-12', 60,  false),

  ('abcd-4x', 2, 'agachamento-livre-barra',0, 4, 8,  '6-8',   150, false),
  ('abcd-4x', 2, 'leg-press-45',           1, 3, 12, '10-12', 90,  false),
  ('abcd-4x', 2, 'terra-romeno',           2, 3, 10, '8-10',  120, false),
  ('abcd-4x', 2, 'mesa-flexora',           3, 3, 12, '10-12', 75,  false),
  ('abcd-4x', 2, 'panturrilha-em-pe',      4, 4, 15, '15-20', 45,  false),

  ('abcd-4x', 3, 'desenvolvimento-halteres',   0, 4, 10, '8-12',  90, false),
  ('abcd-4x', 3, 'elevacao-lateral-halteres',  1, 4, 15, '12-15', 60, false),
  ('abcd-4x', 3, 'crucifixo-inverso-halteres', 2, 3, 15, '12-15', 60, false),
  ('abcd-4x', 3, 'face-pull',                  3, 3, 15, '12-15', 60, false),
  ('abcd-4x', 3, 'encolhimento-barra',         4, 3, 12, '10-12', 60, false),
  ('abcd-4x', 3, 'abdominal-polia',            5, 3, 15, '12-15', 45, false),
  ('abcd-4x', 3, 'prancha-lateral',            6, 3, 30, '30s cada lado', 45, true),

  -- ══ PUSH / PULL / LEGS ═════════════════════════════════════
  ('ppl-6x', 0, 'supino-reto-barra',        0, 4, 8,  '6-8',   150, false),
  ('ppl-6x', 0, 'desenvolvimento-halteres', 1, 3, 10, '8-10',  105, false),
  ('ppl-6x', 0, 'supino-inclinado-halteres',2, 3, 10, '8-12',  90,  false),
  ('ppl-6x', 0, 'elevacao-lateral-halteres',3, 4, 15, '12-15', 60,  false),
  ('ppl-6x', 0, 'triceps-testa-barra-ez',   4, 3, 10, '8-12',  75,  false),
  ('ppl-6x', 0, 'triceps-corda-polia',      5, 3, 12, '12-15', 60,  false),

  ('ppl-6x', 1, 'barra-fixa',             0, 4, 8,  'até a falha', 120, false),
  ('ppl-6x', 1, 'remada-curvada-barra',   1, 4, 8,  '6-8',   150, false),
  ('ppl-6x', 1, 'puxada-frontal-maquina', 2, 3, 12, '10-12', 90,  false),
  ('ppl-6x', 1, 'face-pull',              3, 3, 15, '12-15', 60,  false),
  ('ppl-6x', 1, 'rosca-direta-barra',     4, 3, 10, '8-10',  75,  false),
  ('ppl-6x', 1, 'rosca-martelo',          5, 3, 12, '10-12', 60,  false),

  ('ppl-6x', 2, 'agachamento-livre-barra',0, 4, 6,  '5-6',   180, false),
  ('ppl-6x', 2, 'leg-press-45',           1, 3, 12, '10-12', 120, false),
  ('ppl-6x', 2, 'mesa-flexora',           2, 3, 12, '10-12', 75,  false),
  ('ppl-6x', 2, 'panturrilha-em-pe',      3, 4, 15, '15-20', 45,  false),
  ('ppl-6x', 2, 'abdominal-polia',        4, 3, 15, '12-15', 45,  false),

  ('ppl-6x', 3, 'supino-inclinado-halteres',0, 4, 8,  '8-10',  120, false),
  ('ppl-6x', 3, 'supino-reto-maquina',      1, 3, 12, '10-12', 90,  false),
  ('ppl-6x', 3, 'elevacao-lateral-halteres',2, 4, 15, '12-20', 45,  false),
  ('ppl-6x', 3, 'voador-peck-deck',         3, 3, 15, '12-15', 60,  false),
  ('ppl-6x', 3, 'mergulho-paralelas',       4, 3, 10, 'até a falha', 90, false),
  ('ppl-6x', 3, 'triceps-coice-halter',     5, 3, 15, '12-15', 45,  false),

  ('ppl-6x', 4, 'levantamento-terra',       0, 3, 5,  '4-6',   180, false),
  ('ppl-6x', 4, 'puxada-triangulo',         1, 4, 10, '10-12', 90,  false),
  ('ppl-6x', 4, 'remada-unilateral-halter', 2, 3, 12, '10-12 cada lado', 75, false),
  ('ppl-6x', 4, 'pullover-polia',           3, 3, 12, '12-15', 60,  false),
  ('ppl-6x', 4, 'rosca-scott-maquina',      4, 3, 12, '10-12', 60,  false),
  ('ppl-6x', 4, 'rosca-corda-polia',        5, 3, 15, '12-15', 45,  false),

  ('ppl-6x', 5, 'terra-romeno',            0, 4, 8,  '6-8',   150, false),
  ('ppl-6x', 5, 'agachamento-bulgaro',     1, 3, 10, '10 cada perna', 90, false),
  ('ppl-6x', 5, 'cadeira-extensora',       2, 3, 15, '12-15', 60,  false),
  ('ppl-6x', 5, 'elevacao-pelvica',        3, 3, 12, '10-12', 90,  false),
  ('ppl-6x', 5, 'panturrilha-sentado',     4, 4, 20, '15-20', 45,  false),
  ('ppl-6x', 5, 'elevacao-pernas-barra',   5, 3, 12, '10-15', 60,  false)
) as v(split_slug, day_index, exercise_slug, sort_order, sets, reps, rep_range, rest_seconds, is_time_based)
join public.training_splits s  on s.slug = v.split_slug
join public.split_days d       on d.split_id = s.id and d.day_index = v.day_index
join public.exercises e        on e.slug = v.exercise_slug
on conflict (split_day_id, exercise_id) do nothing;

-- ── 4. Verificação (opcional) ───────────────────────────────
-- Se algum slug de exercício não existir no catálogo, o join acima o ignora
-- em silêncio. Rode a consulta abaixo para conferir se todos os dias
-- receberam a quantidade esperada de exercícios:
--
--   select s.slug, d.day_index, d.label, count(de.id) as exercicios
--   from public.training_splits s
--   join public.split_days d on d.split_id = s.id
--   left join public.split_day_exercises de on de.split_day_id = d.id
--   group by s.slug, d.day_index, d.label
--   order by s.slug, d.day_index;
