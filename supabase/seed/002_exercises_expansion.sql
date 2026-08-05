-- ============================================================
-- 002_exercises_expansion.sql
-- 1) Corrige free_db_id inválidos do seed inicial (mídia 404)
-- 2) Amplia o catálogo para cobrir todos os grupos musculares
--
-- Todos os free_db_id foram validados contra
-- https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================

-- ── 1. Correção dos IDs de mídia inválidos ──────────────────
-- Esses seis slugs apontavam para IDs inexistentes no Free Exercise DB,
-- o que deixava a Camada 3 do mediaResolver retornando 404.

update public.exercises set free_db_id = 'Incline_Dumbbell_Press'
  where slug = 'supino-inclinado-halteres';
update public.exercises set free_db_id = 'Wide-Grip_Lat_Pulldown'
  where slug = 'puxada-frontal-maquina';
update public.exercises set free_db_id = 'Bent_Over_Barbell_Row'
  where slug = 'remada-curvada-barra';
update public.exercises set free_db_id = 'Standing_Military_Press'
  where slug = 'desenvolvimento-militar-barra';
update public.exercises set free_db_id = 'Side_Lateral_Raise'
  where slug = 'elevacao-lateral-halteres';
update public.exercises set free_db_id = 'Stiff-Legged_Dumbbell_Deadlift'
  where slug = 'stiff-halteres';

-- ── 2. Novos exercícios ─────────────────────────────────────
-- rapid_api_id fica null: sem os IDs verificados, a Camada 2 baixaria
-- o GIF errado quando a chave da RapidAPI estiver configurada.

insert into public.exercises
  (name, slug, muscle_group, muscles_worked, equipment, category,
   difficulty, instructions, tips, free_db_id, rapid_api_id)
values

-- ══ PEITO ═══════════════════════════════════════════════════

('Supino Reto na Máquina',
 'supino-reto-maquina', 'Peito',
 ARRAY['Tríceps','Ombro Anterior'],
 'Máquina', 'Empurrão', 'beginner',
 ARRAY[
   'Ajuste o banco para que as manoplas fiquem na altura do meio do peito.',
   'Sente-se com as costas totalmente apoiadas e os pés no chão.',
   'Empurre as manoplas para frente até quase estender os cotovelos.',
   'Retorne de forma controlada até sentir o peito alongar.'
 ],
 ARRAY['Melhor primeiro exercício de peito para iniciantes: a máquina guia o movimento','Não trave os cotovelos no fim do empurrão'],
 'Machine_Bench_Press', null),

('Crossover na Polia',
 'crossover-polia', 'Peito',
 ARRAY['Ombro Anterior'],
 'Cabo', 'Empurrão', 'intermediate',
 ARRAY[
   'Posicione as polias acima da cabeça e segure uma manopla em cada mão.',
   'Dê um passo à frente com o tronco levemente inclinado.',
   'Traga as mãos à frente do corpo em arco, cruzando-as levemente.',
   'Volte devagar até sentir o alongamento do peitoral.'
 ],
 ARRAY['Mantenha os cotovelos levemente flexionados e fixos','Movimento de isolamento: use carga moderada e foque na contração'],
 'Cable_Crossover', null),

('Flexão de Braço',
 'flexao-de-braco', 'Peito',
 ARRAY['Tríceps','Ombro Anterior','Core'],
 'Peso Corporal', 'Empurrão', 'beginner',
 ARRAY[
   'Apoie as mãos no chão um pouco mais afastadas que os ombros.',
   'Mantenha o corpo reto da cabeça aos calcanhares, com o abdômen contraído.',
   'Desça até o peito ficar próximo ao chão.',
   'Empurre o chão para voltar à posição inicial.'
 ],
 ARRAY['Não consegue ainda? Apoie os joelhos no chão ou faça com as mãos num banco','Quadril caindo é sinal de core relaxado'],
 'Pushups', null),

('Voador (Peck Deck)',
 'voador-peck-deck', 'Peito',
 ARRAY['Ombro Anterior'],
 'Máquina', 'Empurrão', 'beginner',
 ARRAY[
   'Ajuste o banco para que as manoplas fiquem na altura dos ombros.',
   'Apoie os antebraços ou segure as manoplas com os cotovelos levemente flexionados.',
   'Feche os braços à frente do peito e segure a contração por um segundo.',
   'Abra de forma controlada até sentir o alongamento.'
 ],
 ARRAY['Costas sempre coladas ao encosto','Ótimo para finalizar o treino de peito'],
 'Butterfly', null),

('Supino Declinado com Barra',
 'supino-declinado-barra', 'Peito',
 ARRAY['Tríceps','Porção Inferior do Peitoral'],
 'Barra', 'Empurrão', 'intermediate',
 ARRAY[
   'Deite no banco declinado prendendo as pernas no apoio.',
   'Segure a barra com pegada um pouco mais larga que os ombros.',
   'Desça a barra até a parte inferior do peito.',
   'Empurre para cima até estender os cotovelos.'
 ],
 ARRAY['Peça ajuda para tirar e recolocar a barra no suporte','Levantar declinado costuma permitir mais carga que o supino reto'],
 'Decline_Barbell_Bench_Press', null),

-- ══ COSTAS ══════════════════════════════════════════════════

('Barra Fixa',
 'barra-fixa', 'Costas',
 ARRAY['Bíceps','Core'],
 'Peso Corporal', 'Puxada', 'advanced',
 ARRAY[
   'Segure a barra com pegada pronada, mais larga que os ombros.',
   'Comece com os braços estendidos e o corpo parado.',
   'Puxe o corpo até o queixo passar da barra, levando os cotovelos para baixo.',
   'Desça de forma controlada até estender os braços.'
 ],
 ARRAY['Use a máquina assistida ou elástico enquanto não consegue o movimento completo','Evite balançar as pernas para ganhar impulso'],
 'Pullups', null),

('Barra Fixa Supinada',
 'barra-fixa-supinada', 'Costas',
 ARRAY['Bíceps'],
 'Peso Corporal', 'Puxada', 'intermediate',
 ARRAY[
   'Segure a barra com as palmas voltadas para você, na largura dos ombros.',
   'Puxe o corpo até o queixo ultrapassar a barra.',
   'Desça de forma controlada.'
 ],
 ARRAY['A pegada supinada recruta mais bíceps e costuma ser mais fácil que a pronada','Bom passo intermediário antes da barra fixa tradicional'],
 'Chin-Up', null),

('Remada Baixa no Cabo',
 'remada-baixa-cabo', 'Costas',
 ARRAY['Bíceps','Romboides','Trapézio'],
 'Cabo', 'Puxada', 'beginner',
 ARRAY[
   'Sente-se com os pés apoiados na plataforma e joelhos levemente flexionados.',
   'Segure o triângulo com os braços estendidos e a coluna neutra.',
   'Puxe o triângulo até o abdômen, aproximando as escápulas.',
   'Retorne devagar sem deixar o tronco ser puxado para frente.'
 ],
 ARRAY['Peito aberto durante todo o movimento','Não use o tronco como alavanca: o movimento é dos braços e das escápulas'],
 'Seated_Cable_Rows', null),

('Remada Unilateral com Halter',
 'remada-unilateral-halter', 'Costas',
 ARRAY['Bíceps','Romboides'],
 'Halter', 'Puxada', 'beginner',
 ARRAY[
   'Apoie um joelho e uma mão no banco, com o tronco paralelo ao chão.',
   'Segure o halter com o braço estendido.',
   'Puxe o halter em direção ao quadril, com o cotovelo próximo ao corpo.',
   'Desça de forma controlada até estender o braço.'
 ],
 ARRAY['Não gire o tronco para puxar mais carga','Ótimo para corrigir diferenças entre os lados'],
 'One-Arm_Dumbbell_Row', null),

('Puxada com Triângulo',
 'puxada-triangulo', 'Costas',
 ARRAY['Bíceps','Dorsal'],
 'Cabo', 'Puxada', 'intermediate',
 ARRAY[
   'Sente-se na puxada e prenda as coxas sob o apoio.',
   'Segure o triângulo com as mãos próximas.',
   'Puxe até a parte superior do peito, levando os cotovelos para baixo e para trás.',
   'Retorne devagar até estender os braços.'
 ],
 ARRAY['A pegada fechada dá mais amplitude ao dorsal','Incline o tronco só levemente para trás'],
 'V-Bar_Pulldown', null),

('Levantamento Terra',
 'levantamento-terra', 'Costas',
 ARRAY['Isquiotibiais','Glúteos','Lombar','Trapézio','Antebraço'],
 'Barra', 'Puxada', 'advanced',
 ARRAY[
   'Posicione os pés na largura do quadril, com a barra sobre o meio dos pés.',
   'Flexione o quadril e os joelhos e segure a barra pouco além da largura das pernas.',
   'Com o peito alto e a coluna neutra, empurre o chão com as pernas para subir.',
   'Estenda quadril e joelhos ao mesmo tempo e desça controlando a barra.'
 ],
 ARRAY['Barra sempre rente às pernas','Se a lombar arredondar, reduza a carga imediatamente','Peça a um instrutor para conferir sua técnica antes de subir a carga'],
 'Barbell_Deadlift', null),

('Pullover na Polia Alta',
 'pullover-polia', 'Costas',
 ARRAY['Dorsal','Tríceps'],
 'Cabo', 'Puxada', 'intermediate',
 ARRAY[
   'Em pé de frente para a polia alta, segure a barra com os braços quase estendidos.',
   'Incline levemente o tronco à frente com o abdômen contraído.',
   'Puxe a barra até as coxas mantendo os cotovelos fixos.',
   'Retorne devagar até sentir o dorsal alongar.'
 ],
 ARRAY['Cotovelos travados: quem trabalha é o dorsal, não o tríceps','Ideal para sentir a contração das costas sem envolver muito o bíceps'],
 'Straight-Arm_Pulldown', null),

('Hiperextensão Lombar',
 'hiperextensao-lombar', 'Lombar',
 ARRAY['Glúteos','Isquiotibiais'],
 'Peso Corporal', 'Puxada', 'beginner',
 ARRAY[
   'Ajuste o apoio do banco na altura do quadril.',
   'Cruze os braços no peito e desça o tronco flexionando o quadril.',
   'Suba até o corpo formar uma linha reta.',
   'Evite passar da linha do corpo ao subir.'
 ],
 ARRAY['Movimento vem do quadril, não da coluna','Excelente para fortalecer a lombar e proteger o agachamento e o terra'],
 'Hyperextensions_Back_Extensions', null),

-- ══ OMBRO E TRAPÉZIO ════════════════════════════════════════

('Desenvolvimento com Halteres',
 'desenvolvimento-halteres', 'Ombro',
 ARRAY['Tríceps','Trapézio Superior'],
 'Halter', 'Empurrão', 'beginner',
 ARRAY[
   'Sente-se com o encosto quase na vertical, um halter em cada mão na altura dos ombros.',
   'Empurre os halteres para cima até quase estender os cotovelos.',
   'Desça de forma controlada até a altura das orelhas.'
 ],
 ARRAY['Costas apoiadas e abdômen contraído para proteger a lombar','Não bata os halteres no topo'],
 'Dumbbell_Shoulder_Press', null),

('Elevação Frontal com Halteres',
 'elevacao-frontal-halteres', 'Ombro',
 ARRAY['Deltoide Anterior'],
 'Halter', 'Empurrão', 'beginner',
 ARRAY[
   'Em pé, segure um halter em cada mão à frente das coxas.',
   'Eleve um braço de cada vez até a altura dos ombros.',
   'Desça de forma controlada.'
 ],
 ARRAY['Não balance o tronco para dar impulso','Carga leve resolve: é um exercício de isolamento'],
 'Front_Dumbbell_Raise', null),

('Crucifixo Inverso com Halteres',
 'crucifixo-inverso-halteres', 'Ombro',
 ARRAY['Deltoide Posterior','Romboides'],
 'Halter', 'Puxada', 'beginner',
 ARRAY[
   'Incline o tronco à frente com a coluna neutra, um halter em cada mão.',
   'Com os cotovelos levemente flexionados, abra os braços para os lados.',
   'Suba até a altura dos ombros e desça devagar.'
 ],
 ARRAY['Trabalha a parte de trás do ombro, quase sempre esquecida','Use pouca carga e foque em juntar as escápulas'],
 'Reverse_Flyes', null),

('Face Pull na Polia',
 'face-pull', 'Ombro',
 ARRAY['Deltoide Posterior','Trapézio','Manguito Rotador'],
 'Cabo', 'Puxada', 'intermediate',
 ARRAY[
   'Ajuste a polia na altura do rosto e segure a corda com as duas mãos.',
   'Puxe a corda em direção à testa, separando as mãos.',
   'Termine com os cotovelos altos e as escápulas juntas.',
   'Retorne devagar.'
 ],
 ARRAY['Grande aliado da postura de quem passa o dia sentado','Carga leve e execução limpa valem mais que peso alto aqui'],
 'Face_Pull', null),

('Encolhimento com Barra',
 'encolhimento-barra', 'Trapézio',
 ARRAY['Antebraço'],
 'Barra', 'Puxada', 'beginner',
 ARRAY[
   'Em pé, segure a barra à frente do corpo com pegada pronada.',
   'Eleve os ombros em direção às orelhas sem flexionar os cotovelos.',
   'Segure um instante no topo e desça devagar.'
 ],
 ARRAY['Não gire os ombros: o movimento é só para cima e para baixo','Use alças se a pegada falhar antes do trapézio'],
 'Barbell_Shrug', null),

('Remada Alta com Barra',
 'remada-alta-barra', 'Ombro',
 ARRAY['Trapézio','Bíceps'],
 'Barra', 'Puxada', 'intermediate',
 ARRAY[
   'Segure a barra com pegada pronada na largura dos ombros.',
   'Puxe a barra para cima rente ao corpo até a altura do peito.',
   'Mantenha os cotovelos acima das mãos e desça controlando.'
 ],
 ARRAY['Se sentir desconforto no ombro, abra um pouco a pegada ou troque pelo face pull','Não suba além da altura do peito'],
 'Upright_Barbell_Row', null),

-- ══ BÍCEPS ══════════════════════════════════════════════════

('Rosca Martelo',
 'rosca-martelo', 'Bíceps',
 ARRAY['Braquial','Braquiorradial'],
 'Halter', 'Puxada', 'beginner',
 ARRAY[
   'Em pé, segure um halter em cada mão com as palmas voltadas para o corpo.',
   'Flexione um cotovelo por vez mantendo a pegada neutra.',
   'Desça de forma controlada até estender o braço.'
 ],
 ARRAY['Pegada neutra dá mais espessura ao braço e poupa o punho','Cotovelos parados ao lado do tronco'],
 'Alternate_Hammer_Curl', null),

('Rosca Scott na Máquina',
 'rosca-scott-maquina', 'Bíceps',
 ARRAY['Braquial'],
 'Máquina', 'Puxada', 'beginner',
 ARRAY[
   'Ajuste o assento para que as axilas fiquem apoiadas no topo do apoio.',
   'Segure as manoplas com pegada supinada.',
   'Flexione os cotovelos até a contração máxima.',
   'Desça devagar sem estender totalmente no final.'
 ],
 ARRAY['O apoio elimina o balanço do tronco: isolamento puro','Descida lenta é onde está o ganho'],
 'Machine_Preacher_Curls', null),

('Rosca Concentrada',
 'rosca-concentrada', 'Bíceps',
 ARRAY['Braquial'],
 'Halter', 'Puxada', 'beginner',
 ARRAY[
   'Sente-se no banco e apoie o cotovelo na parte interna da coxa.',
   'Com o braço estendido, flexione o cotovelo trazendo o halter ao ombro.',
   'Desça de forma controlada.'
 ],
 ARRAY['Melhor exercício para sentir o bíceps trabalhando','Não mova o ombro: só o antebraço sobe'],
 'Concentration_Curls', null),

('Rosca com Corda na Polia',
 'rosca-corda-polia', 'Bíceps',
 ARRAY['Braquiorradial'],
 'Cabo', 'Puxada', 'beginner',
 ARRAY[
   'Prenda a corda na polia baixa e segure com pegada neutra.',
   'Com os cotovelos junto ao tronco, flexione os braços.',
   'Desça controlando a volta do peso.'
 ],
 ARRAY['O cabo mantém tensão constante do início ao fim','Não deixe o peso bater na pilha ao descer'],
 'Cable_Hammer_Curls_-_Rope_Attachment', null),

-- ══ TRÍCEPS ═════════════════════════════════════════════════

('Tríceps Corda na Polia',
 'triceps-corda-polia', 'Tríceps',
 ARRAY[]::text[],
 'Cabo', 'Empurrão', 'beginner',
 ARRAY[
   'Em pé de frente para a polia alta, segure a corda com pegada neutra.',
   'Com os cotovelos junto ao corpo, estenda os braços para baixo.',
   'Abra levemente a corda no final do movimento.',
   'Retorne devagar até os cotovelos formarem 90°.'
 ],
 ARRAY['Cotovelos colados ao tronco: se abrirem, o peito entra no movimento','Melhor exercício de tríceps para começar'],
 'Triceps_Pushdown_-_Rope_Attachment', null),

('Tríceps Francês com Halter',
 'triceps-frances-halter', 'Tríceps',
 ARRAY[]::text[],
 'Halter', 'Empurrão', 'intermediate',
 ARRAY[
   'Em pé ou sentado, segure um halter com as duas mãos acima da cabeça.',
   'Flexione os cotovelos descendo o halter atrás da nuca.',
   'Estenda os cotovelos até voltar ao topo.'
 ],
 ARRAY['Cotovelos apontados para cima e parados','Comece com carga leve: a posição exige controle'],
 'Standing_Dumbbell_Triceps_Extension', null),

('Mergulho nas Paralelas',
 'mergulho-paralelas', 'Tríceps',
 ARRAY['Peito','Ombro Anterior'],
 'Peso Corporal', 'Empurrão', 'advanced',
 ARRAY[
   'Apoie-se nas barras paralelas com os braços estendidos.',
   'Desça flexionando os cotovelos até formarem cerca de 90°.',
   'Empurre para cima até estender os braços.'
 ],
 ARRAY['Tronco mais vertical foca tríceps; inclinado foca peito','Use a máquina assistida enquanto ganha força'],
 'Dips_-_Triceps_Version', null),

('Tríceps no Banco',
 'triceps-banco', 'Tríceps',
 ARRAY['Ombro Anterior'],
 'Peso Corporal', 'Empurrão', 'beginner',
 ARRAY[
   'De costas para o banco, apoie as mãos na borda com os dedos para frente.',
   'Estenda as pernas à frente com os calcanhares no chão.',
   'Desça o quadril flexionando os cotovelos até cerca de 90°.',
   'Empurre o banco para voltar.'
 ],
 ARRAY['Joelhos dobrados deixam mais fácil; pernas esticadas, mais difícil','Não desça além do confortável para o ombro'],
 'Bench_Dips', null),

('Tríceps Coice com Halter',
 'triceps-coice-halter', 'Tríceps',
 ARRAY[]::text[],
 'Halter', 'Empurrão', 'beginner',
 ARRAY[
   'Incline o tronco à frente com um halter na mão e o cotovelo dobrado a 90°.',
   'Mantenha o braço colado ao corpo e estenda o cotovelo para trás.',
   'Segure a contração e volte devagar.'
 ],
 ARRAY['O ombro fica parado: só o antebraço se move','Carga leve — é um exercício de finalização'],
 'Tricep_Dumbbell_Kickback', null),

-- ══ QUADRÍCEPS ══════════════════════════════════════════════

('Agachamento Hack na Máquina',
 'agachamento-hack', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais'],
 'Máquina', 'Pernas', 'intermediate',
 ARRAY[
   'Apoie as costas e os ombros nos suportes da máquina.',
   'Posicione os pés na plataforma na largura dos ombros.',
   'Destrave e desça até os joelhos formarem cerca de 90°.',
   'Empurre a plataforma sem travar os joelhos no topo.'
 ],
 ARRAY['Alternativa segura ao agachamento livre para quem está começando','Joelhos alinhados com a ponta dos pés'],
 'Hack_Squat', null),

('Afundo com Halteres',
 'afundo-halteres', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais','Core'],
 'Halter', 'Pernas', 'beginner',
 ARRAY[
   'Em pé, segure um halter em cada mão ao lado do corpo.',
   'Dê um passo à frente e desça até o joelho de trás quase tocar o chão.',
   'Empurre com a perna da frente para voltar.',
   'Alterne as pernas a cada repetição.'
 ],
 ARRAY['Tronco ereto e olhar à frente ajudam no equilíbrio','Comece sem peso até dominar o movimento'],
 'Dumbbell_Lunges', null),

('Agachamento Búlgaro',
 'agachamento-bulgaro', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais'],
 'Halter', 'Pernas', 'intermediate',
 ARRAY[
   'Apoie o peito do pé de trás em um banco.',
   'Com a perna da frente à frente do corpo, desça flexionando o joelho.',
   'Desça até a coxa da frente ficar quase paralela ao chão.',
   'Empurre com o calcanhar da frente para subir.'
 ],
 ARRAY['Um dos melhores exercícios para glúteo e equilíbrio','Ajuste a distância do banco até achar a posição confortável'],
 'Split_Squat_with_Dumbbells', null),

('Agachamento no Smith',
 'agachamento-smith', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Posicione a barra do Smith sobre os trapézios.',
   'Coloque os pés levemente à frente do corpo, na largura dos ombros.',
   'Desça até as coxas ficarem paralelas ao chão.',
   'Empurre o chão para subir mantendo o peito alto.'
 ],
 ARRAY['A barra guiada dá segurança para aprender o padrão do agachamento','Destrave e trave a barra sempre com o movimento parado'],
 'Smith_Machine_Squat', null),

('Agachamento Livre (Peso Corporal)',
 'agachamento-peso-corporal', 'Quadríceps',
 ARRAY['Glúteos','Isquiotibiais','Core'],
 'Peso Corporal', 'Pernas', 'beginner',
 ARRAY[
   'Pés na largura dos ombros, pontas levemente para fora.',
   'Desça o quadril para trás e para baixo, mantendo o peito alto.',
   'Desça até onde conseguir sem arredondar a lombar.',
   'Empurre o chão para voltar à posição inicial.'
 ],
 ARRAY['Ponto de partida obrigatório antes de agachar com barra','Braços à frente ajudam no equilíbrio'],
 'Bodyweight_Squat', null),

('Subida no Banco com Halteres',
 'subida-no-banco', 'Quadríceps',
 ARRAY['Glúteos','Core'],
 'Halter', 'Pernas', 'intermediate',
 ARRAY[
   'Segure um halter em cada mão de frente para um banco firme.',
   'Suba apoiando o pé inteiro no banco e estendendo o joelho.',
   'Desça de forma controlada com a mesma perna.',
   'Complete as repetições e troque de lado.'
 ],
 ARRAY['Evite dar impulso com a perna de trás','Escolha uma altura em que o joelho fique perto de 90° no início'],
 'Dumbbell_Step_Ups', null),

('Agachamento Goblet',
 'agachamento-goblet', 'Quadríceps',
 ARRAY['Glúteos','Core'],
 'Halter', 'Pernas', 'beginner',
 ARRAY[
   'Segure um halter ou kettlebell junto ao peito com as duas mãos.',
   'Pés na largura dos ombros, pontas levemente para fora.',
   'Desça mantendo o tronco ereto e os cotovelos entre os joelhos.',
   'Empurre o chão para subir.'
 ],
 ARRAY['O peso à frente ajuda a manter o tronco ereto: ótimo para aprender a agachar','Melhor porta de entrada antes do agachamento com barra'],
 'Goblet_Squat', null),

-- ══ POSTERIOR E GLÚTEOS ═════════════════════════════════════

('Mesa Flexora',
 'mesa-flexora', 'Isquiotibiais',
 ARRAY['Panturrilha'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Deite de bruços com o apoio na parte de trás dos tornozelos.',
   'Segure as manoplas e mantenha o quadril colado no banco.',
   'Flexione os joelhos trazendo os calcanhares aos glúteos.',
   'Desça devagar sem deixar o peso bater.'
 ],
 ARRAY['Quadril colado: se ele subir, a lombar entra no movimento','Isolamento essencial para equilibrar o volume de quadríceps'],
 'Lying_Leg_Curls', null),

('Cadeira Flexora',
 'cadeira-flexora', 'Isquiotibiais',
 ARRAY['Panturrilha'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Sente-se com as costas apoiadas e o rolo sobre a parte de trás dos tornozelos.',
   'Trave o apoio das coxas.',
   'Flexione os joelhos empurrando o rolo para baixo.',
   'Retorne de forma controlada.'
 ],
 ARRAY['Versão sentada costuma dar mais alongamento que a mesa flexora','Não estenda totalmente os joelhos ao voltar'],
 'Seated_Leg_Curl', null),

('Levantamento Terra Romeno',
 'terra-romeno', 'Isquiotibiais',
 ARRAY['Glúteos','Lombar'],
 'Barra', 'Pernas', 'intermediate',
 ARRAY[
   'Em pé, segure a barra à frente das coxas com pegada pronada.',
   'Com os joelhos levemente flexionados, empurre o quadril para trás.',
   'Desça a barra rente às pernas até sentir os isquiotibiais alongarem.',
   'Contraia os glúteos para voltar à posição inicial.'
 ],
 ARRAY['Coluna neutra do início ao fim: se arredondar, pare e reduza a carga','A barra desce rente à perna, nunca à frente do corpo'],
 'Romanian_Deadlift', null),

('Elevação Pélvica com Barra',
 'elevacao-pelvica', 'Glúteos',
 ARRAY['Isquiotibiais','Core'],
 'Barra', 'Pernas', 'intermediate',
 ARRAY[
   'Sente-se no chão com as costas apoiadas num banco e a barra sobre o quadril.',
   'Apoie os pés no chão na largura do quadril.',
   'Empurre o quadril para cima até o corpo formar uma linha reta.',
   'Segure a contração no topo e desça devagar.'
 ],
 ARRAY['Use uma almofada na barra para proteger o quadril','Queixo levemente para baixo evita hiperextensão da lombar'],
 'Barbell_Hip_Thrust', null),

('Ponte de Glúteo',
 'ponte-gluteo', 'Glúteos',
 ARRAY['Isquiotibiais','Core'],
 'Peso Corporal', 'Pernas', 'beginner',
 ARRAY[
   'Deite de costas com os joelhos flexionados e os pés apoiados no chão.',
   'Empurre os calcanhares contra o chão e eleve o quadril.',
   'Contraia os glúteos no topo e desça devagar.'
 ],
 ARRAY['Versão sem equipamento da elevação pélvica: dá para fazer em casa','Não force a lombar: o movimento vem do glúteo'],
 'Butt_Lift_Bridge', null),

('Cadeira Abdutora',
 'cadeira-abdutora', 'Glúteos',
 ARRAY['Glúteo Médio'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Sente-se com a lateral externa das coxas contra os apoios.',
   'Abra as pernas contra a resistência até o limite confortável.',
   'Segure um instante e retorne devagar.'
 ],
 ARRAY['Tronco levemente inclinado à frente aumenta a ativação do glúteo médio','Evite usar impulso: o retorno também é trabalho'],
 'Thigh_Abductor', null),

('Coice de Glúteo na Polia',
 'coice-gluteo-polia', 'Glúteos',
 ARRAY['Isquiotibiais'],
 'Cabo', 'Pernas', 'intermediate',
 ARRAY[
   'Prenda a caneleira no tornozelo e fique de frente para a polia baixa.',
   'Apoie as mãos no suporte com o tronco levemente inclinado.',
   'Estenda a perna para trás contraindo o glúteo.',
   'Volte devagar sem tocar o peso na pilha.'
 ],
 ARRAY['O movimento é do quadril, não da lombar','Amplitude curta e boa contração valem mais que carga alta'],
 'One-Legged_Cable_Kickback', null),

-- ══ PANTURRILHA ═════════════════════════════════════════════

('Panturrilha em Pé na Máquina',
 'panturrilha-em-pe', 'Panturrilha',
 ARRAY['Gastrocnêmio'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Posicione os ombros sob os apoios e a ponta dos pés na plataforma.',
   'Desça os calcanhares até sentir o alongamento.',
   'Suba na ponta dos pés o máximo que conseguir.',
   'Segure um instante no topo.'
 ],
 ARRAY['Amplitude completa é mais importante que carga','Faça repetições mais altas: a panturrilha responde bem a volume'],
 'Standing_Calf_Raises', null),

('Panturrilha Sentado',
 'panturrilha-sentado', 'Panturrilha',
 ARRAY['Sóleo'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Sente-se com a ponta dos pés na plataforma e o apoio sobre as coxas.',
   'Desça os calcanhares até o alongamento máximo.',
   'Suba na ponta dos pés e contraia.'
 ],
 ARRAY['Com o joelho dobrado, o trabalho vai para o sóleo — complementa a versão em pé','Movimento lento nas duas fases'],
 'Seated_Calf_Raise', null),

('Panturrilha no Leg Press',
 'panturrilha-leg-press', 'Panturrilha',
 ARRAY['Gastrocnêmio','Sóleo'],
 'Máquina', 'Pernas', 'beginner',
 ARRAY[
   'Posicione a ponta dos pés na parte inferior da plataforma do leg press.',
   'Com os joelhos levemente flexionados, empurre a plataforma com a ponta dos pés.',
   'Desça controlando até alongar a panturrilha.'
 ],
 ARRAY['Nunca destrave a máquina com os joelhos totalmente estendidos','Aproveite quando já estiver no leg press: economiza tempo de treino'],
 'Calf_Press_On_The_Leg_Press_Machine', null),

-- ══ CORE E ANTEBRAÇO ════════════════════════════════════════

('Abdominal Supra',
 'abdominal-supra', 'Core',
 ARRAY['Reto Abdominal'],
 'Peso Corporal', 'Core', 'beginner',
 ARRAY[
   'Deite de costas com os joelhos flexionados e os pés no chão.',
   'Apoie as mãos ao lado da cabeça sem puxar o pescoço.',
   'Eleve o tronco contraindo o abdômen.',
   'Desça devagar sem relaxar totalmente no chão.'
 ],
 ARRAY['Queixo afastado do peito: quem sobe é o tronco, não a cabeça','Expire ao subir'],
 'Crunches', null),

('Abdominal na Polia',
 'abdominal-polia', 'Core',
 ARRAY['Reto Abdominal','Oblíquos'],
 'Cabo', 'Core', 'intermediate',
 ARRAY[
   'Ajoelhe-se de costas para a polia alta segurando a corda ao lado da cabeça.',
   'Flexione o tronco levando os cotovelos em direção às coxas.',
   'Contraia o abdômen no ponto mais baixo.',
   'Retorne devagar.'
 ],
 ARRAY['O quadril fica parado: quem se move é a coluna','Permite progredir carga no abdômen, o que o crunch livre não permite'],
 'Cable_Crunch', null),

('Elevação de Pernas na Barra',
 'elevacao-pernas-barra', 'Core',
 ARRAY['Reto Abdominal','Flexores do Quadril'],
 'Peso Corporal', 'Core', 'advanced',
 ARRAY[
   'Pendure-se na barra fixa com os braços estendidos.',
   'Sem balançar, eleve as pernas até a altura do quadril ou acima.',
   'Desça de forma controlada.'
 ],
 ARRAY['Comece com joelhos flexionados e evolua para pernas esticadas','Se balançar, você está usando impulso em vez do abdômen'],
 'Hanging_Leg_Raise', null),

('Prancha Lateral',
 'prancha-lateral', 'Core',
 ARRAY['Oblíquos','Glúteo Médio'],
 'Peso Corporal', 'Core', 'beginner',
 ARRAY[
   'Deite de lado apoiando o antebraço no chão sob o ombro.',
   'Eleve o quadril até o corpo formar uma linha reta.',
   'Segure a posição respirando normalmente.',
   'Troque de lado.'
 ],
 ARRAY['Ombro sempre alinhado sobre o cotovelo','Apoiar o joelho de baixo deixa a versão mais fácil'],
 'Side_Bridge', null),

('Abdominal Bicicleta',
 'abdominal-bicicleta', 'Core',
 ARRAY['Oblíquos','Reto Abdominal'],
 'Peso Corporal', 'Core', 'beginner',
 ARRAY[
   'Deite de costas com as mãos ao lado da cabeça e as pernas elevadas.',
   'Leve o cotovelo em direção ao joelho oposto girando o tronco.',
   'Alterne os lados de forma contínua e controlada.'
 ],
 ARRAY['Movimento controlado vale mais que velocidade','Não puxe a cabeça com as mãos'],
 'Air_Bike', null),

('Rotação Russa',
 'rotacao-russa', 'Core',
 ARRAY['Oblíquos'],
 'Peso Corporal', 'Core', 'beginner',
 ARRAY[
   'Sente-se com os joelhos flexionados e o tronco inclinado para trás.',
   'Junte as mãos à frente do peito (ou segure um peso).',
   'Gire o tronco de um lado para o outro tocando o chão ao lado do quadril.'
 ],
 ARRAY['Coluna neutra: evite arredondar as costas','Elevar os pés aumenta a dificuldade'],
 'Russian_Twist', null),

('Escalador',
 'escalador', 'Core',
 ARRAY['Ombro','Quadríceps'],
 'Peso Corporal', 'Core', 'beginner',
 ARRAY[
   'Comece na posição de flexão com o corpo alinhado.',
   'Traga um joelho em direção ao peito e volte.',
   'Alterne as pernas em ritmo constante.'
 ],
 ARRAY['Quadril na altura dos ombros durante todo o exercício','Serve como aquecimento ou como finalizador metabólico'],
 'Mountain_Climbers', null),

('Rosca de Punho com Barra',
 'rosca-punho-barra', 'Antebraço',
 ARRAY['Flexores do Punho'],
 'Barra', 'Puxada', 'beginner',
 ARRAY[
   'Sente-se e apoie os antebraços nas coxas com as palmas para cima.',
   'Deixe a barra rolar até a ponta dos dedos.',
   'Flexione os punhos elevando a barra o máximo possível.'
 ],
 ARRAY['Amplitude curta é normal aqui','Ajuda quem perde a pegada antes das costas no treino de puxada'],
 'Palms-Down_Wrist_Curl_Over_A_Bench', null),

('Caminhada do Fazendeiro',
 'caminhada-fazendeiro', 'Antebraço',
 ARRAY['Trapézio','Core','Glúteos'],
 'Halter', 'Core', 'intermediate',
 ARRAY[
   'Segure um halter pesado em cada mão ao lado do corpo.',
   'Com o peito alto e os ombros para trás, caminhe em linha reta.',
   'Percorra a distância planejada e apoie os pesos com cuidado.'
 ],
 ARRAY['Conte por distância ou tempo, não por repetições','Trabalha pegada, core e postura de uma vez só'],
 'Farmers_Walk', null)

on conflict (slug) do nothing;
