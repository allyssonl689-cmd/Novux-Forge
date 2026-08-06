-- ============================================================
-- 005_catalog_enrichment.sql
-- Usuário procurou "Crucifixo na Máquina" e "Gravitron" e não achou.
--
-- 1) "Voador (Peck Deck)" já é o mesmo exercício que "Crucifixo na
--    Máquina" — só o nome não incluía o termo. Renomeado para incluir os
--    dois, sem trocar slug/free_db_id (histórico e planos continuam
--    apontando pro mesmo exercício).
-- 2) Gravitron é o nome popular da estação de puxada/mergulho assistidos
--    — dois exercícios novos. O Free Exercise DB não tem um GIF do
--    aparelho assistido de verdade (só "Dip Machine", que é a máquina de
--    tríceps sentado, um aparelho diferente) — em vez de usar um GIF do
--    aparelho errado, `free_db_id` fica null; a tela cai no vídeo do
--    YouTube, que mostra o Gravitron de verdade.
-- ============================================================

update public.exercises
   set name = 'Crucifixo na Máquina (Voador)'
 where slug = 'voador-peck-deck';

insert into public.exercises (
  name, slug, muscle_group, muscles_worked, equipment, category, difficulty,
  instructions, tips, is_public, free_db_id,
  common_mistakes, setup_steps, breathing, tempo, safety_notes
) values (
  'Puxada Assistida (Gravitron)',
  'puxada-assistida-gravitron',
  'Costas',
  array['Bíceps', 'Antebraço'],
  'Máquina',
  'Puxada',
  'beginner',
  array[
    'Ajuste o contrapeso de assistência — mais peso no pino = mais ajuda, mais fácil.',
    'Suba na plataforma e segure a barra com as mãos um pouco mais largas que os ombros.',
    'Puxe o corpo para cima até o queixo passar a altura da barra.',
    'Desça controlado até os braços quase estenderem, sem soltar a tensão.'
  ],
  array[
    'Comece com bastante assistência — reduzir o contrapeso com o tempo é o sinal de que você está evoluindo, não precisa ter pressa.',
    'Puxe com os cotovelos, não só com as mãos: imagine levar os cotovelos para baixo e para trás.'
  ],
  true,
  null,
  array[
    'Balançar o corpo para compensar em vez de puxar com as costas.',
    'Usar assistência insuficiente e compensar com o pescoço/ombros travados.'
  ],
  array[
    'A plataforma some assim que os joelhos saem dela — não pule, deixe o peso do corpo entrar devagar.'
  ],
  'Expira puxando para cima, inspira na descida controlada.',
  null,
  null
),
(
  'Mergulho Assistido (Gravitron)',
  'mergulho-assistido-gravitron',
  'Tríceps',
  array['Peito', 'Ombro'],
  'Máquina',
  'Empurrão',
  'beginner',
  array[
    'Ajuste o contrapeso de assistência antes de subir.',
    'Suba na plataforma e apoie as mãos nas barras paralelas, braços estendidos.',
    'Desça flexionando os cotovelos até formarem cerca de 90°, cotovelos próximos ao corpo.',
    'Empurre de volta até quase estender os braços, sem travar a articulação com força.'
  ],
  array[
    'Cotovelos colados ao corpo focam mais o tríceps; abertos, envolvem mais o peito.',
    'Não precisa descer até o fundo se sentir desconforto no ombro — pare no ponto confortável.'
  ],
  true,
  null,
  array[
    'Descer demais e forçar o ombro além do confortável.',
    'Usar assistência baixa demais logo no início, comprometendo a técnica.'
  ],
  array[
    'A plataforma sobe assim que você tira o peso — desça dela com cuidado, sem saltar.'
  ],
  'Expira empurrando para cima, inspira na descida.',
  null,
  'Se sentir dor (não desconforto muscular) no ombro na descida, pare no ponto anterior.'
);
