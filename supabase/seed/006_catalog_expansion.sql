-- ============================================================
-- 006_catalog_expansion.sql
-- Expansão moderada do catálogo (71 → ~107): prioriza os grupos mais
-- rasos (trapézio, lombar, antebraço, panturrilha, glúteos) e acrescenta
-- variações sólidas e não-redundantes nos grupos já cobertos. Todos os
-- free_db_id foram checados contra o Free Exercise DB antes de entrar
-- (nome do arquivo + 2 imagens confirmadas), seguindo a mesma regra da
-- Fase B.
-- ============================================================

insert into public.exercises (
  name, slug, muscle_group, muscles_worked, equipment, category, difficulty,
  instructions, tips, is_public, free_db_id,
  common_mistakes, setup_steps, breathing, tempo, safety_notes
) values

-- ── Trapézio ──────────────────────────────────────────────
(
  'Encolhimento com Halteres', 'encolhimento-halteres', 'Trapézio', array['Antebraço'],
  'Halter', 'Puxada', 'beginner',
  array['Em pé, um halter em cada mão ao lado do corpo.', 'Eleve os ombros na direção das orelhas, sem dobrar os cotovelos.', 'Segure 1 segundo no topo e desça controlado.'],
  array['O movimento é só de ombro para cima — não gire os ombros para trás, isso não trabalha mais o trapézio e sobrecarrega a articulação.'],
  true, 'Dumbbell_Shrug',
  array['Girar os ombros em círculo em vez de subir e descer em linha reta.', 'Usar os braços/cotovelos para ajudar a "puxar" o peso.'],
  null, 'Expira subindo os ombros, inspira na descida.', null, null
),
(
  'Encolhimento no Cabo', 'encolhimento-cabo', 'Trapézio', array['Antebraço'],
  'Cabo', 'Puxada', 'beginner',
  array['Fique em pé de frente para a polia baixa, barra reta na mão.', 'Eleve os ombros na direção das orelhas, cotovelos travados.', 'Desça controlado até sentir o alongamento do trapézio.'],
  array['A tensão constante do cabo (diferente do halter) ajuda a sentir o músculo trabalhando do início ao fim do movimento.'],
  true, 'Cable_Shrugs',
  array['Deixar o peso "cair" na descida em vez de controlar.'],
  array['Ajuste a polia na posição mais baixa antes de pegar a barra.'],
  'Expira subindo, inspira descendo.', null, null
),

-- ── Lombar ────────────────────────────────────────────────
(
  'Bom Dia com Barra', 'bom-dia-barra', 'Lombar', array['Isquiotibiais', 'Glúteos'],
  'Barra', 'Puxada', 'beginner',
  array['Barra apoiada nas costas como no agachamento, joelhos levemente flexionados.', 'Incline o tronco para frente pelo quadril, mantendo a coluna neutra, até sentir alongar os posteriores de coxa.', 'Volte à posição inicial contraindo lombar e glúteos.'],
  array['Comece com uma carga bem leve (ou só a barra) — é um movimento novo para a maioria e a técnica vem antes do peso.', 'O joelho quase não se move; o movimento é no quadril.'],
  true, 'Stiff_Leg_Barbell_Good_Morning',
  array['Arredondar a coluna em vez de manter neutra — é o erro que mais machuca aqui.', 'Descer rápido demais.'],
  null, 'Inspira antes de descer, expira ao voltar.', '3 segundos na descida, sem pressa.',
  'Se sentir dor na lombar (não alongamento nos posteriores), pare e reduza a amplitude ou a carga.'
),

-- ── Antebraço ─────────────────────────────────────────────
(
  'Rosca de Punho com Halteres', 'rosca-punho-halteres', 'Antebraço', array[]::text[],
  'Halter', 'Puxada', 'beginner',
  array['Sentado, antebraços apoiados nas coxas ou num banco, palmas para cima, halteres na mão.', 'Deixe o peso descer flexionando o punho para baixo.', 'Curve o punho para cima o máximo possível, contraindo o antebraço.'],
  array['Amplitude pequena é normal — o movimento é só do punho.'],
  true, 'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench',
  array['Usar o cotovelo/braço para ajudar em vez de isolar o punho.'],
  null, 'Expira subindo o punho, inspira na descida.', null, null
),
(
  'Rosca de Dedos com Barra', 'rosca-dedos-barra', 'Antebraço', array[]::text[],
  'Barra', 'Puxada', 'beginner',
  array['Sentado, antebraços apoiados nas coxas, barra apoiada só nas pontas dos dedos.', 'Feche os dedos enrolando a barra para dentro da mão.', 'Abra os dedos de volta até a barra quase escapar (sem deixar cair).'],
  array['Ótimo complemento à rosca de punho — trabalha a pegada, útil para levantamento terra e puxadas.'],
  true, 'Finger_Curls',
  array['Usar carga alta — aqui o controle importa mais que o peso.'],
  null, 'Expira fechando os dedos, inspira abrindo.', null, null
),

-- ── Panturrilha ───────────────────────────────────────────
(
  'Panturrilha na Barra Guiada', 'panturrilha-smith', 'Panturrilha', array[]::text[],
  'Máquina', 'Pernas', 'beginner',
  array['Posicione a barra guiada nos ombros, pontas dos pés numa plataforma ou anilha.', 'Desça os calcanhares o máximo possível, alongando a panturrilha.', 'Suba na ponta dos pés o mais alto possível e segure 1 segundo.'],
  array['A amplitude completa (descer bem embaixo) importa mais que o peso.'],
  true, 'Smith_Machine_Calf_Raise',
  array['Fazer o movimento rápido e pequeno — perde a maior parte do trabalho.'],
  array['Trave a barra guiada e confirme que a plataforma está estável antes de carregar peso.'],
  'Expira subindo, inspira descendo.', '2 segundos na subida, 2 na descida.', null
),
(
  'Panturrilha Unilateral com Halter', 'panturrilha-unilateral-halter', 'Panturrilha', array[]::text[],
  'Halter', 'Pernas', 'beginner',
  array['Em pé numa plataforma elevada (ou anilha), um halter na mão do mesmo lado da perna de trabalho.', 'Desça o calcanhar alongando a panturrilha.', 'Suba na ponta do pé o mais alto possível.'],
  array['Fazer uma perna por vez ajuda a corrigir desequilíbrio entre os lados.'],
  true, 'Dumbbell_Seated_One-Leg_Calf_Raise',
  array['Usar a outra perna para "roubar" no impulso.'],
  null, 'Expira subindo, inspira descendo.', null, null
),

-- ── Glúteos ───────────────────────────────────────────────
(
  'Coice de Glúteo no Solo', 'coice-gluteo-solo', 'Glúteos', array['Isquiotibiais'],
  'Peso Corporal', 'Pernas', 'beginner',
  array['Apoie mãos e joelhos no solo (posição de quatro apoios).', 'Empurre um pé para trás e para cima, mantendo o joelho dobrado a 90°.', 'Contraia o glúteo no topo e desça controlado.'],
  array['Foque em "empurrar o teto com o pé" em vez de só levantar a perna — ajuda a sentir o glúteo, não a lombar.'],
  true, 'Glute_Kickback',
  array['Arquear a lombar para ganhar mais amplitude — o movimento é pequeno e isso é normal.'],
  null, 'Expira empurrando para cima, inspira na descida.', null, null
),
(
  'Elevação Pélvica Unilateral', 'elevacao-pelvica-unilateral', 'Glúteos', array['Isquiotibiais'],
  'Peso Corporal', 'Pernas', 'beginner',
  array['Deitado, joelhos dobrados, uma perna estendida no ar.', 'Empurre o quadril para cima usando só a perna apoiada no chão.', 'Contraia o glúteo no topo e desça controlado.'],
  array['Progressão natural da ponte de glúteo tradicional — faça essa quando a bilateral ficar fácil.'],
  true, 'Single_Leg_Glute_Bridge',
  array['Deixar o quadril torto (um lado mais alto que o outro) em vez de subir nivelado.'],
  null, 'Expira subindo o quadril, inspira descendo.', null, null
),
(
  'Extensão Reversa de Quadril na Máquina', 'extensao-reversa-quadril', 'Glúteos', array['Isquiotibiais', 'Lombar'],
  'Máquina', 'Pernas', 'intermediate',
  array['Deite de frente no aparelho, tornozelos sob o apoio almofadado.', 'Estenda o quadril elevando as pernas para trás, contraindo o glúteo.', 'Desça controlado até quase tocar o apoio.'],
  array['Boa alternativa de baixo impacto para quem sente desconforto na lombar em outros exercícios de glúteo.'],
  true, 'Reverse_Hyperextension',
  array['Usar o balanço do corpo em vez de contrair o glúteo para levantar o peso.'],
  array['Ajuste a altura do apoio de tronco para o quadril ficar livre para o movimento.'],
  'Expira elevando as pernas, inspira na descida.', null, null
),

-- ── Isquiotibiais ─────────────────────────────────────────
(
  'Flexora em Pé na Máquina', 'flexora-em-pe', 'Isquiotibiais', array[]::text[],
  'Máquina', 'Pernas', 'beginner',
  array['Em pé no aparelho, apoio atrás do tornozelo de uma perna.', 'Flexione o joelho levando o calcanhar em direção ao glúteo.', 'Desça controlado até quase estender a perna.'],
  array['Trabalha uma perna por vez — bom para corrigir diferença de força entre os lados.'],
  true, 'Standing_Leg_Curl',
  array['Inclinar o quadril para frente para "ajudar" o movimento em vez de isolar o posterior de coxa.'],
  array['Ajuste o apoio do tornozelo pouco acima do calcanhar.'],
  'Expira flexionando o joelho, inspira na descida.', null, null
),

-- ── Peito ─────────────────────────────────────────────────
(
  'Supino Inclinado com Barra', 'supino-inclinado-barra', 'Peito', array['Ombro', 'Tríceps'],
  'Barra', 'Empurrão', 'beginner',
  array['Deite no banco inclinado (30-45°), pegada um pouco mais larga que os ombros.', 'Desça a barra controlada até a parte superior do peito.', 'Empurre a barra de volta até estender os braços, sem travar os cotovelos com força.'],
  array['Foca mais a parte superior do peito que o supino reto — bom complemento, não substituto.'],
  true, 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  array['Inclinação exagerada do banco (fica parecido com desenvolvimento, perde o foco no peito).'],
  array['Sempre use os pinos de segurança ou peça ajuda de um observador na primeira vez com carga nova.'],
  'Expira empurrando para cima, inspira na descida.', null,
  'Nunca faça sem observador em cargas próximas do seu limite — risco real de a barra cair no peito.'
),
(
  'Crucifixo Inclinado com Halteres', 'crucifixo-inclinado-halteres', 'Peito', array['Ombro'],
  'Halter', 'Empurrão', 'beginner',
  array['Deite no banco inclinado, halteres acima do peito, braços levemente flexionados.', 'Abra os braços em arco até sentir o alongamento do peito.', 'Feche voltando os halteres para cima, como abraçando um tronco de árvore.'],
  array['Mantenha uma flexão leve e fixa no cotovelo do início ao fim — não é rosca, o cotovelo não dobra mais durante o movimento.'],
  true, 'Incline_Dumbbell_Flyes',
  array['Descer demais e forçar o ombro além do confortável.', 'Usar carga alta demais — este exercício pede controle, não peso.'],
  null, 'Expira fechando os braços, inspira abrindo.', null,
  'Pare no ponto em que sentir alongamento — descer além disso é um risco real para o ombro.'
),
(
  'Supino Inclinado na Máquina', 'supino-inclinado-maquina', 'Peito', array['Ombro', 'Tríceps'],
  'Máquina', 'Empurrão', 'beginner',
  array['Ajuste o banco/apoio na altura indicada pelo aparelho.', 'Empurre as alças para frente até quase estender os braços.', 'Volte controlado até sentir o alongamento do peito.'],
  array['Boa opção para treinar peito superior sem depender de equilíbrio — o aparelho guia o movimento.'],
  true, 'Leverage_Incline_Chest_Press',
  array['Sentar longe demais do apoio, perdendo o encosto da lombar.'],
  array['Ajuste o assento até as alças ficarem na altura do meio do peito.'],
  'Expira empurrando, inspira na volta.', null, null
),
(
  'Crossover Baixo na Polia', 'crossover-baixo-polia', 'Peito', array['Ombro'],
  'Cabo', 'Empurrão', 'beginner',
  array['Polias ajustadas na posição baixa, um cabo em cada mão.', 'Puxe os cabos para frente e para cima, cruzando na frente do peito.', 'Volte controlado até sentir o alongamento.'],
  array['O ângulo de baixo para cima foca a parte superior do peito — complementa o crossover na altura dos ombros.'],
  true, 'Low_Cable_Crossover',
  array['Usar as costas/tronco para "empurrar" em vez de isolar o peito.'],
  null, 'Expira fechando os braços, inspira abrindo.', null, null
),
(
  'Flexão Inclinada', 'flexao-inclinada', 'Peito', array['Ombro', 'Tríceps'],
  'Peso Corporal', 'Empurrão', 'beginner',
  array['Mãos apoiadas num banco ou step, corpo em prancha inclinada.', 'Desça o peito em direção ao apoio, cotovelos a cerca de 45° do corpo.', 'Empurre de volta até estender os braços.'],
  array['Quanto mais alto o apoio das mãos, mais fácil — ótima progressão para quem ainda não faz flexão no solo.'],
  true, 'Incline_Push-Up',
  array['Deixar o quadril cair ou subir demais em vez de manter o corpo alinhado.'],
  null, 'Expira subindo, inspira descendo.', null, null
),

-- ── Ombro ─────────────────────────────────────────────────
(
  'Desenvolvimento Arnold', 'desenvolvimento-arnold', 'Ombro', array['Tríceps'],
  'Halter', 'Empurrão', 'intermediate',
  array['Sentado, halteres na altura dos ombros, palmas voltadas para o corpo.', 'Empurre para cima girando os punhos até as palmas ficarem para frente no topo.', 'Desça girando de volta à posição inicial.'],
  array['A rotação recruta mais fibras do ombro que o desenvolvimento tradicional — mas exige mais controle, comece com carga leve.'],
  true, 'Arnold_Dumbbell_Press',
  array['Girar rápido demais e perder o controle da carga no meio do movimento.'],
  null, 'Expira empurrando para cima, inspira na descida.', null, null
),
(
  'Elevação Lateral no Cabo', 'elevacao-lateral-cabo', 'Ombro', array[]::text[],
  'Cabo', 'Empurrão', 'beginner',
  array['De lado para a polia baixa, segure o cabo com a mão mais afastada da máquina.', 'Eleve o braço lateralmente até a altura do ombro.', 'Desça controlado.'],
  array['A tensão constante do cabo (sem "folga" no início do movimento) faz esse exercício parecer mais difícil que a versão com halter — é esperado.'],
  true, 'Standing_Low-Pulley_Deltoid_Raise',
  array['Usar o corpo para embalar/impulsionar o peso.'],
  array['Ajuste a polia na posição mais baixa e escolha um peso menor que o usado com halteres.'],
  'Expira subindo o braço, inspira na descida.', null, null
),
(
  'Desenvolvimento na Máquina', 'desenvolvimento-maquina', 'Ombro', array['Tríceps'],
  'Máquina', 'Empurrão', 'beginner',
  array['Sentado, encosto ajustado, alças na altura dos ombros.', 'Empurre para cima até quase estender os braços, sem travar os cotovelos.', 'Desça controlado até a posição inicial.'],
  array['Boa entrada para quem ainda não tem confiança para o desenvolvimento livre com barra ou halteres.'],
  true, 'Machine_Shoulder_Military_Press',
  array['Arquear demais a lombar para ajudar a empurrar.'],
  array['Ajuste o assento até as alças ficarem alinhadas com os ombros, não acima da cabeça.'],
  'Expira empurrando para cima, inspira na descida.', null, null
),
(
  'Elevação Posterior com Halteres', 'elevacao-posterior-halteres', 'Ombro', array['Costas'],
  'Halter', 'Puxada', 'beginner',
  array['Sentado, tronco inclinado para frente apoiado nas próprias coxas ou num banco.', 'Com halteres leves, eleve os braços para os lados até a altura dos ombros.', 'Desça controlado.'],
  array['Trabalha o deltoide posterior, o mais esquecido dos três — ajuda na postura de quem passa o dia sentado.'],
  true, 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  array['Usar carga alta e compensar com balanço do tronco — aqui menos peso e mais controle rende muito mais.'],
  null, 'Expira subindo os braços, inspira na descida.', null, null
),

-- ── Bíceps ────────────────────────────────────────────────
(
  'Rosca Alternada com Halteres', 'rosca-alternada-halteres', 'Bíceps', array['Antebraço'],
  'Halter', 'Puxada', 'beginner',
  array['Em pé ou sentado, halteres ao lado do corpo, palmas para frente.', 'Flexione um braço trazendo o halter até o ombro, girando o punho se preferir.', 'Desça controlado e repita com o outro braço.'],
  array['Alternar os braços permite focar 100% em cada lado, sem compensar com o tronco.'],
  true, 'Dumbbell_Alternate_Bicep_Curl',
  array['Balançar o tronco para "ajudar" a subir o peso.'],
  null, 'Expira subindo, inspira descendo.', null, null
),
(
  'Rosca Scott com Barra', 'rosca-scott-barra', 'Bíceps', array[]::text[],
  'Barra', 'Puxada', 'beginner',
  array['Sente-se no banco Scott, braços apoiados na almofada inclinada.', 'Flexione os cotovelos trazendo a barra até perto do ombro.', 'Desça controlado até quase estender os braços.'],
  array['O apoio elimina o balanço do corpo — isola o bíceps melhor que a rosca em pé, mas exige carga mais leve.'],
  true, 'Preacher_Curl',
  array['Estender o braço até travar o cotovelo no fundo do movimento — mantenha uma leve flexão.'],
  array['Ajuste o banco até a axila encaixar na borda de cima da almofada.'],
  'Expira subindo, inspira descendo.', null, null
),
(
  'Rosca Direta no Cabo', 'rosca-direta-cabo', 'Bíceps', array['Antebraço'],
  'Cabo', 'Puxada', 'beginner',
  array['De pé de frente para a polia baixa, barra reta ou W na mão.', 'Flexione os cotovelos trazendo a barra até perto do peito.', 'Desça controlado.'],
  array['A tensão constante do cabo mantém o bíceps trabalhando até no ponto mais baixo do movimento, diferente da barra livre.'],
  true, 'Standing_Biceps_Cable_Curl',
  array['Afastar os cotovelos do corpo durante a subida.'],
  null, 'Expira subindo, inspira descendo.', null, null
),

-- ── Tríceps ───────────────────────────────────────────────
(
  'Supino Pegada Fechada', 'supino-pegada-fechada', 'Tríceps', array['Peito', 'Ombro'],
  'Barra', 'Empurrão', 'beginner',
  array['Deite no banco, pegada na barra na largura dos ombros ou pouco menor.', 'Desça a barra até perto do peito, cotovelos próximos ao corpo.', 'Empurre de volta estendendo os braços.'],
  array['Cotovelos colados ao corpo (não abertos como no supino normal) é o que muda o foco para o tríceps.'],
  true, 'Close-Grip_Barbell_Bench_Press',
  array['Pegada exagerada demais (muito fechada) — sobrecarrega o pulso sem ganho extra para o tríceps.'],
  array['Sempre use os pinos de segurança ou peça ajuda de um observador na primeira vez com carga nova.'],
  'Expira empurrando, inspira na descida.', null,
  'Nunca faça sem observador em cargas próximas do seu limite.'
),
(
  'Tríceps na Polia Pegada V', 'triceps-polia-v', 'Tríceps', array[]::text[],
  'Cabo', 'Empurrão', 'beginner',
  array['De pé de frente para a polia alta, pegue a barra V com as duas mãos.', 'Mantendo os cotovelos fixos ao lado do corpo, estenda os braços para baixo.', 'Volte controlado até os cotovelos formarem 90°.'],
  array['A pegada V permite girar levemente os punhos no final do movimento, o que ajuda a contrair mais o tríceps.'],
  true, 'Triceps_Pushdown_-_V-Bar_Attachment',
  array['Deixar os cotovelos "escaparem" para frente durante o movimento.'],
  null, 'Expira estendendo os braços, inspira na volta.', null, null
),
(
  'Tríceps Testa na Máquina', 'triceps-testa-maquina', 'Tríceps', array[]::text[],
  'Máquina', 'Empurrão', 'beginner',
  array['Sentado, braços apoiados nas alças do aparelho, cotovelos alinhados ao eixo de rotação.', 'Estenda os braços contraindo o tríceps.', 'Volte controlado.'],
  array['Boa opção para quem sente desconforto no cotovelo na versão livre com barra EZ — o aparelho guia o trajeto.'],
  true, 'Machine_Triceps_Extension',
  array['Sentar deslocado do eixo do aparelho, perdendo a trajetória correta.'],
  array['Ajuste o assento até os cotovelos ficarem alinhados com o eixo de rotação do aparelho.'],
  'Expira estendendo os braços, inspira na volta.', null, null
),

-- ── Costas ────────────────────────────────────────────────
(
  'Puxada Frontal Pegada Fechada', 'puxada-frontal-fechada', 'Costas', array['Bíceps'],
  'Cabo', 'Puxada', 'beginner',
  array['Sentado na puxada, pegue a barra com as mãos próximas (pegada fechada).', 'Puxe a barra até perto do peito, levando os cotovelos para baixo.', 'Volte controlado até quase estender os braços.'],
  array['A pegada fechada recruta mais a parte interna das costas e o bíceps que a pegada aberta.'],
  true, 'Close-Grip_Front_Lat_Pulldown',
  array['Puxar com os braços em vez de levar os cotovelos para baixo e para trás.'],
  array['Ajuste o apoio das coxas para os pés ficarem firmes no chão.'],
  'Expira puxando, inspira na volta.', null, null
),
(
  'Remada Cavalinho', 'remada-cavalinho', 'Costas', array['Bíceps'],
  'Barra', 'Puxada', 'beginner',
  array['Uma ponta da barra apoiada no chão/canto, pegue a outra ponta com as duas mãos.', 'Incline o tronco para frente mantendo a coluna neutra.', 'Puxe a barra até perto do peito, cotovelos próximos ao corpo.'],
  array['Boa opção quando a remada curvada tradicional incomoda a lombar — a barra apoiada tira parte da carga da coluna.'],
  true, 'T-Bar_Row_with_Handle',
  array['Arredondar a coluna para puxar mais peso.'],
  null, 'Expira puxando, inspira na volta.', null,
  'Mantenha a coluna neutra durante todo o movimento — arredondar sob carga é o principal risco aqui.'
),
(
  'Remada Unilateral Sentada no Cabo', 'remada-unilateral-sentada-cabo', 'Costas', array['Bíceps'],
  'Cabo', 'Puxada', 'beginner',
  array['Sentado de frente para a polia baixa, pegue o cabo com uma mão.', 'Puxe o cotovelo para trás, levando o cabo até perto do quadril.', 'Volte controlado até quase estender o braço.'],
  array['Trabalhar um lado por vez ajuda a corrigir diferenças de força entre os lados das costas.'],
  true, 'Seated_One-arm_Cable_Pulley_Rows',
  array['Girar o tronco para "ajudar" a puxar em vez de isolar as costas.'],
  null, 'Expira puxando, inspira na volta.', null, null
),
(
  'Remada Alta na Máquina', 'remada-alta-maquina', 'Costas', array['Bíceps', 'Ombro'],
  'Máquina', 'Puxada', 'beginner',
  array['Sentado, peito apoiado no encosto do aparelho, alças na altura dos ombros.', 'Puxe as alças para trás, levando os cotovelos atrás do corpo.', 'Volte controlado até quase estender os braços.'],
  array['O apoio no peito impede o balanço do tronco — ótimo para quem ainda está aprendendo a sentir as costas trabalhando.'],
  true, 'Leverage_High_Row',
  array['Levantar o peito do apoio para puxar mais peso.'],
  array['Ajuste o assento até as alças ficarem na altura do peito.'],
  'Expira puxando, inspira na volta.', null, null
),

-- ── Quadríceps ────────────────────────────────────────────
(
  'Afundo com Barra', 'afundo-barra', 'Quadríceps', array['Glúteos'],
  'Barra', 'Pernas', 'intermediate',
  array['Barra apoiada nas costas como no agachamento.', 'Dê um passo à frente e desça até o joelho de trás quase tocar o chão.', 'Empurre pelo calcanhar da frente para voltar em pé.'],
  array['Faça primeiro sem barra até dominar o equilíbrio — adicionar carga a um movimento instável é onde vêm as lesões.'],
  true, 'Barbell_Lunge',
  array['Deixar o joelho da frente passar muito além da ponta do pé.'],
  null, 'Inspira descendo, expira subindo.', null,
  'Pratique sem peso até ter equilíbrio antes de adicionar a barra.'
),
(
  'Cadeira Extensora Unilateral', 'cadeira-extensora-unilateral', 'Quadríceps', array[]::text[],
  'Máquina', 'Pernas', 'beginner',
  array['Sentado no aparelho, apoio na canela de uma perna só.', 'Estenda a perna até quase travar o joelho.', 'Desça controlado.'],
  array['Faz o mesmo trabalho da cadeira extensora tradicional, mas revela e corrige diferenças de força entre as duas pernas.'],
  true, 'Single-Leg_Leg_Extension',
  array['Usar impulso para "chutar" o peso em vez de controlar a subida.'],
  array['Ajuste o encosto até o joelho ficar alinhado com o eixo de rotação do aparelho.'],
  'Expira estendendo a perna, inspira na descida.', null, null
),
(
  'Agachamento no Banco com Halteres', 'agachamento-banco-halteres', 'Quadríceps', array['Glúteos'],
  'Halter', 'Pernas', 'intermediate',
  array['Um halter em cada mão, um banco baixo atrás de você.', 'Agache até sentar levemente no banco, sem relaxar o peso todo.', 'Empurre pelos calcanhares para voltar em pé.'],
  array['O banco é uma referência de profundidade seguro para quem está aprendendo a sentir o agachamento completo.'],
  true, 'Dumbbell_Squat_To_A_Bench',
  array['"Cair" sentado no banco em vez de tocar levemente e voltar a subir.'],
  null, 'Inspira descendo, expira subindo.', null,
  'Toque o banco de forma controlada — sentar com o peso todo pode forçar a lombar.'
),

-- ── Core ──────────────────────────────────────────────────
(
  'Dead Bug', 'dead-bug', 'Core', array[]::text[],
  'Peso Corporal', 'Core', 'beginner',
  array['Deitado, braços esticados para o teto, joelhos dobrados a 90° no ar.', 'Estenda um braço e a perna oposta ao mesmo tempo, quase tocando o chão.', 'Volte à posição inicial e repita do outro lado.'],
  array['Mantenha a lombar colada no chão o tempo todo — se ela arquear, reduza a amplitude.'],
  true, 'Dead_Bug',
  array['Deixar a lombar descolar do chão ao estender braço e perna.'],
  null, 'Expira estendendo, inspira voltando.', null, null
),
(
  'Elevação de Pernas no Solo', 'elevacao-pernas-solo', 'Core', array[]::text[],
  'Peso Corporal', 'Core', 'beginner',
  array['Deitado de costas, pernas estendidas, mãos ao lado do corpo ou embaixo do quadril.', 'Eleve as pernas retas até formarem 90° com o chão.', 'Desça controlado sem deixar tocar o chão.'],
  array['Boa progressão antes da elevação de pernas na barra — trabalha o mesmo padrão sem precisar sustentar o peso do corpo.'],
  true, 'Flat_Bench_Lying_Leg_Raise',
  array['Deixar a lombar arquear ao descer as pernas — desça só até onde conseguir manter a lombar no chão.'],
  null, 'Expira subindo as pernas, inspira na descida.', null, null
),
(
  'Rotação de Tronco no Cabo (Wood Chop)', 'rotacao-tronco-cabo', 'Core', array['Ombro'],
  'Cabo', 'Core', 'beginner',
  array['De lado para a polia alta, segure o cabo com as duas mãos.', 'Gire o tronco puxando o cabo na diagonal até a altura do quadril oposto.', 'Volte controlado à posição inicial.'],
  array['O movimento vem da rotação do tronco, não dos braços — pense em girar a caixa torácica.'],
  true, 'Standing_Cable_Wood_Chop',
  array['Fazer o movimento só com os braços, sem girar o tronco.'],
  null, 'Expira girando, inspira voltando.', null, null
);
