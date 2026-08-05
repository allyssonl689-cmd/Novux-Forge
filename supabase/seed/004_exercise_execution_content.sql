-- ============================================================
-- 004_exercise_execution_content.sql
-- Conteúdo de execução prática para os 69 exercícios do catálogo.
-- Requer: migrations/005_exercise_execution.sql
-- Idempotente (todos os comandos são UPDATE por slug).
-- ============================================================

-- ── 1. Erros comuns ─────────────────────────────────────────
-- O item mais valioso para iniciante: o que costuma dar errado.

update public.exercises e
set common_mistakes = v.mistakes
from (values

-- PEITO
('supino-reto-barra', ARRAY['Quicar a barra no peito para ganhar impulso','Levantar os glúteos do banco na hora do esforço','Abrir os cotovelos a 90° do tronco, o que sobrecarrega o ombro']::text[]),
('supino-inclinado-halteres', ARRAY['Inclinar o banco além de 45°, virando um desenvolvimento de ombro','Descer tanto que o ombro gira para frente','Bater os halteres um no outro no topo']::text[]),
('crucifixo-halteres', ARRAY['Dobrar e estender os cotovelos, transformando o exercício em supino','Descer os braços abaixo da linha do banco e forçar a articulação','Usar carga alta num exercício de isolamento']::text[]),
('supino-reto-maquina', ARRAY['Ajustar o banco na altura errada, deixando as manoplas acima do peito','Descolar as costas do encosto para empurrar mais']::text[]),
('crossover-polia', ARRAY['Usar o tronco para empurrar o peso','Estender os cotovelos e transformar em exercício de tríceps','Voltar rápido e perder a tensão no peito']::text[]),
('flexao-de-braco', ARRAY['Deixar o quadril cair ou subir demais','Descer só até a metade','Abrir os cotovelos a 90° do tronco']::text[]),
('voador-peck-deck', ARRAY['Encolher os ombros durante o fechamento','Voltar rápido e perder a tensão','Regular o assento baixo demais']::text[]),
('supino-declinado-barra', ARRAY['Descer a barra no meio do peito em vez da porção inferior','Tirar a barra do suporte sozinho com carga alta']::text[]),

-- COSTAS
('puxada-frontal-maquina', ARRAY['Puxar a barra atrás da nuca','Balançar o tronco para vencer a carga','Soltar a barra rápido e perder a fase de descida']::text[]),
('remada-curvada-barra', ARRAY['Arredondar a lombar','Subir o tronco a cada repetição para ajudar','Puxar a barra até o peito em vez do abdômen']::text[]),
('puxada-supinada', ARRAY['Encolher os ombros no início da puxada','Usar impulso de quadril para vencer a carga']::text[]),
('barra-fixa', ARRAY['Balançar as pernas para ganhar impulso','Não estender os braços no fim da descida','Encolher os ombros em vez de puxar com as costas']::text[]),
('barra-fixa-supinada', ARRAY['Subir só até a metade','Descer rápido demais e perder o controle']::text[]),
('remada-baixa-cabo', ARRAY['Deixar o tronco ser puxado para frente no retorno','Puxar só com os braços, sem juntar as escápulas','Curvar as costas para alcançar o triângulo']::text[]),
('remada-unilateral-halter', ARRAY['Girar o tronco para acompanhar o peso','Puxar o halter em direção ao ombro em vez do quadril']::text[]),
('puxada-triangulo', ARRAY['Inclinar demais o tronco para trás','Parar a puxada antes de chegar ao peito']::text[]),
('levantamento-terra', ARRAY['Arredondar a lombar na subida','Afastar a barra das pernas','Estender o quadril antes dos joelhos, virando um bom-dia']::text[]),
('pullover-polia', ARRAY['Dobrar os cotovelos e transformar em tríceps','Usar carga que obriga o tronco a balançar']::text[]),
('hiperextensao-lombar', ARRAY['Passar muito da linha do corpo na subida','Fazer o movimento com a coluna em vez do quadril']::text[]),

-- OMBRO E TRAPÉZIO
('desenvolvimento-militar-barra', ARRAY['Arquear demais a lombar para empurrar','Subir a barra à frente da cabeça em vez de na linha do corpo','Travar a respiração durante toda a série']::text[]),
('elevacao-lateral-halteres', ARRAY['Subir acima da linha dos ombros','Usar impulso do quadril','Girar muito o polegar para baixo, comprimindo o ombro']::text[]),
('desenvolvimento-halteres', ARRAY['Descer os halteres muito abaixo das orelhas com carga alta','Bater os halteres um no outro no topo','Perder o apoio das costas no encosto']::text[]),
('elevacao-frontal-halteres', ARRAY['Balançar o tronco para dar impulso','Subir acima da linha dos olhos']::text[]),
('crucifixo-inverso-halteres', ARRAY['Usar carga alta e transformar o movimento em remada','Levantar o tronco ao longo da série']::text[]),
('face-pull', ARRAY['Puxar com carga alta e encolher os ombros','Terminar o movimento com os cotovelos baixos']::text[]),
('encolhimento-barra', ARRAY['Girar os ombros em círculo','Dobrar os cotovelos e puxar com os braços']::text[]),
('remada-alta-barra', ARRAY['Subir a barra acima da linha do peito, comprimindo o ombro','Usar pegada muito fechada']::text[]),

-- BÍCEPS
('rosca-direta-barra', ARRAY['Balançar o tronco para subir a barra','Levar os cotovelos à frente do corpo','Não estender o braço no final da descida']::text[]),
('rosca-martelo', ARRAY['Girar o punho no meio do movimento','Usar o ombro para ajudar a subir o peso']::text[]),
('rosca-scott-maquina', ARRAY['Estender totalmente o cotovelo com carga alta','Tirar as axilas do apoio para ganhar amplitude']::text[]),
('rosca-concentrada', ARRAY['Mover o ombro para ajudar','Descer o halter rápido demais']::text[]),
('rosca-corda-polia', ARRAY['Afastar os cotovelos do tronco','Deixar o peso bater na pilha no retorno']::text[]),

-- TRÍCEPS
('triceps-testa-barra-ez', ARRAY['Abrir os cotovelos para os lados','Descer a barra rápido em direção à testa','Mover os ombros junto com os cotovelos']::text[]),
('triceps-corda-polia', ARRAY['Afastar os cotovelos do corpo','Inclinar o tronco para empurrar o peso com o peso corporal']::text[]),
('triceps-frances-halter', ARRAY['Deixar os cotovelos abrirem para os lados','Arquear a lombar para compensar a carga']::text[]),
('mergulho-paralelas', ARRAY['Descer além do confortável para o ombro','Encolher os ombros no ponto mais baixo']::text[]),
('triceps-banco', ARRAY['Afastar demais o corpo do banco','Descer com os ombros à frente dos cotovelos']::text[]),
('triceps-coice-halter', ARRAY['Mover o ombro em vez de só o antebraço','Usar carga alta e não estender o cotovelo por completo']::text[]),

-- QUADRÍCEPS
('agachamento-livre-barra', ARRAY['Deixar os joelhos colapsarem para dentro','Tirar os calcanhares do chão','Arredondar a lombar no ponto mais baixo']::text[]),
('leg-press-45', ARRAY['Tirar os glúteos do banco no ponto mais baixo','Travar os joelhos com força no topo','Posicionar os pés muito baixos na plataforma']::text[]),
('cadeira-extensora', ARRAY['Usar impulso e balançar o tronco','Travar o joelho com força no topo']::text[]),
('agachamento-hack', ARRAY['Descer com os joelhos muito à frente dos pés','Descolar as costas do apoio']::text[]),
('afundo-halteres', ARRAY['Dar um passo curto demais e sobrecarregar o joelho','Deixar o joelho da frente girar para dentro','Inclinar demais o tronco à frente']::text[]),
('agachamento-bulgaro', ARRAY['Apoiar o pé de trás em um banco alto demais','Deixar o joelho da frente girar para dentro']::text[]),
('agachamento-smith', ARRAY['Posicionar os pés embaixo do corpo, forçando o joelho','Descer só até a metade']::text[]),
('agachamento-peso-corporal', ARRAY['Levantar os calcanhares do chão','Inclinar demais o tronco à frente']::text[]),
('subida-no-banco', ARRAY['Empurrar com a perna de trás para subir','Escolher um banco alto demais']::text[]),
('agachamento-goblet', ARRAY['Deixar o peso afastar do peito','Arredondar as costas no ponto mais baixo']::text[]),

-- POSTERIOR E GLÚTEOS
('mesa-flexora', ARRAY['Tirar o quadril do banco para puxar mais','Deixar o peso bater na volta']::text[]),
('cadeira-flexora', ARRAY['Não travar o apoio das coxas','Estender totalmente o joelho no retorno']::text[]),
('stiff-halteres', ARRAY['Dobrar demais os joelhos, virando um agachamento','Arredondar a lombar','Descer além do que a flexibilidade permite']::text[]),
('terra-romeno', ARRAY['Dobrar os joelhos como num agachamento','Afastar a barra das pernas','Arredondar a lombar no ponto mais baixo']::text[]),
('elevacao-pelvica', ARRAY['Hiperestender a lombar no topo em vez de contrair o glúteo','Apoiar a barra no quadril sem proteção']::text[]),
('ponte-gluteo', ARRAY['Empurrar com a ponta dos pés em vez do calcanhar','Subir usando a lombar em vez do glúteo']::text[]),
('cadeira-abdutora', ARRAY['Usar impulso para abrir as pernas','Soltar o peso de volta sem controle']::text[]),
('coice-gluteo-polia', ARRAY['Arquear a lombar para levar a perna mais longe','Girar o quadril durante o movimento']::text[]),

-- PANTURRILHA
('panturrilha-em-pe', ARRAY['Fazer meia amplitude','Quicar no ponto mais baixo usando o tendão']::text[]),
('panturrilha-sentado', ARRAY['Subir só com impulso','Não descer o calcanhar até alongar']::text[]),
('panturrilha-leg-press', ARRAY['Destravar a máquina com os joelhos totalmente estendidos','Deixar o pé escorregar da plataforma']::text[]),

-- CORE
('prancha-abdominal', ARRAY['Deixar o quadril subir ou afundar','Prender a respiração','Olhar para frente e tensionar o pescoço']::text[]),
('abdominal-supra', ARRAY['Puxar a cabeça com as mãos','Subir o tronco inteiro em vez de flexionar a coluna']::text[]),
('abdominal-polia', ARRAY['Mover o quadril em vez da coluna','Puxar com os braços em vez do abdômen']::text[]),
('elevacao-pernas-barra', ARRAY['Balançar o corpo para dar impulso','Usar só o flexor do quadril, sem enrolar a pelve']::text[]),
('prancha-lateral', ARRAY['Deixar o quadril cair','Apoiar o cotovelo à frente da linha do ombro']::text[]),
('abdominal-bicicleta', ARRAY['Fazer rápido demais e perder a rotação do tronco','Puxar o pescoço com as mãos']::text[]),
('rotacao-russa', ARRAY['Arredondar as costas','Girar só os braços, sem levar o tronco junto']::text[]),
('escalador', ARRAY['Deixar o quadril subir acima da linha dos ombros','Perder o apoio firme das mãos']::text[]),

-- ANTEBRAÇO
('rosca-punho-barra', ARRAY['Mover o antebraço em vez de só o punho','Usar carga que impede a amplitude completa']::text[]),
('caminhada-fazendeiro', ARRAY['Encolher os ombros e inclinar o tronco','Andar rápido demais e perder a postura']::text[])

) as v(slug, mistakes)
where e.slug = v.slug;

-- ── 2. Respiração e cadência ────────────────────────────────
-- Regra por padrão de movimento; os casos especiais são sobrescritos abaixo.

update public.exercises
set breathing = 'Inspire ao descer o peso e expire ao empurrar.',
    tempo = '2-0-1-0'
where category = 'Empurrão';

update public.exercises
set breathing = 'Inspire antes de puxar e expire durante a puxada.',
    tempo = '2-0-1-0'
where category = 'Puxada';

update public.exercises
set breathing = 'Inspire ao descer e expire ao subir, empurrando o chão.',
    tempo = '2-1-1-0'
where category = 'Pernas';

update public.exercises
set breathing = 'Respire de forma contínua durante todo o movimento; nunca prenda o ar.',
    tempo = 'Movimento controlado, sem impulso'
where category = 'Core';

-- Exercícios com carga alta sobre a coluna: pressão intra-abdominal
update public.exercises
set breathing = 'Inspire fundo e segure o ar durante a descida para estabilizar o tronco; expire só depois de passar o ponto mais difícil da subida.'
where slug in ('agachamento-livre-barra','levantamento-terra','terra-romeno','desenvolvimento-militar-barra');

-- Isométricos: não há cadência, há tempo sob tensão
update public.exercises
set breathing = 'Respiração calma e contínua. Prender o ar aumenta a pressão e encurta a sustentação.',
    tempo = 'Isometria — conte o tempo, não repetições'
where slug in ('prancha-abdominal','prancha-lateral');

update public.exercises
set breathing = 'Respire de forma constante durante a caminhada.',
    tempo = 'Por tempo ou distância'
where slug = 'caminhada-fazendeiro';

update public.exercises
set tempo = 'Ritmo constante, sem pausa entre as repetições'
where slug in ('escalador','abdominal-bicicleta');

-- ── 3. Ajustes antes da primeira série ──────────────────────
-- Onde o iniciante mais trava: regulagem de banco, apoio e pegada.

update public.exercises e
set setup_steps = v.steps
from (values

('supino-reto-maquina', ARRAY['Ajuste o banco até as manoplas ficarem na altura do meio do peito.','Sente-se e confirme que as costas e os ombros encostam no apoio.','Escolha uma carga que permita completar todas as repetições com controle.']::text[]),
('voador-peck-deck', ARRAY['Regule o assento para que as manoplas fiquem na altura dos ombros.','Ajuste a amplitude inicial para sentir alongamento sem desconforto no ombro.']::text[]),
('puxada-frontal-maquina', ARRAY['Ajuste o apoio das coxas para que as pernas fiquem firmes.','Escolha a barra e a pegada antes de sentar.','Sente-se apenas depois de encaixar as coxas sob o apoio.']::text[]),
('remada-baixa-cabo', ARRAY['Prenda o triângulo na polia baixa.','Apoie os pés na plataforma com os joelhos levemente flexionados.','Puxe o triângulo até a posição inicial antes de começar a série.']::text[]),
('rosca-scott-maquina', ARRAY['Ajuste o assento até as axilas apoiarem no topo do apoio.','Confirme que os cotovelos ficam alinhados com o eixo da máquina.']::text[]),
('mesa-flexora', ARRAY['Ajuste o rolo para ficar logo acima do calcanhar, não sobre o tendão.','Alinhe os joelhos com o eixo de rotação da máquina.']::text[]),
('cadeira-flexora', ARRAY['Regule o encosto para que os joelhos fiquem alinhados ao eixo da máquina.','Trave o apoio sobre as coxas antes da primeira repetição.']::text[]),
('cadeira-extensora', ARRAY['Ajuste o encosto para que o joelho fique na borda do assento.','Posicione o rolo logo acima do peito do pé.']::text[]),
('leg-press-45', ARRAY['Ajuste o encosto para que o quadril fique bem apoiado.','Posicione os pés na largura dos ombros, no meio da plataforma.','Destrave a máquina só com os pés já posicionados.']::text[]),
('agachamento-hack', ARRAY['Apoie ombros e costas nos suportes antes de destravar.','Posicione os pés na largura dos ombros, levemente à frente do quadril.']::text[]),
('agachamento-smith', ARRAY['Posicione a barra sobre os trapézios, nunca sobre o pescoço.','Coloque os pés um pouco à frente do corpo.','Teste o destravamento da barra sem carga primeiro.']::text[]),
('cadeira-abdutora', ARRAY['Regule a abertura inicial para começar com as pernas juntas, sem desconforto.','Sente-se com as costas apoiadas e os pés firmes.']::text[]),
('panturrilha-em-pe', ARRAY['Ajuste a altura dos ombros para ficar em pé com os joelhos estendidos.','Posicione a ponta dos pés na plataforma, com o calcanhar livre.']::text[]),
('panturrilha-sentado', ARRAY['Ajuste o apoio para descansar sobre as coxas, perto do joelho.','Deixe a ponta dos pés na plataforma e o calcanhar livre.']::text[]),
('hiperextensao-lombar', ARRAY['Ajuste o apoio na altura do quadril, não da barriga.','Encaixe os calcanhares sob o rolo antes de iniciar.']::text[]),
('triceps-corda-polia', ARRAY['Prenda a corda na polia alta.','Fique a um passo da máquina, com os cotovelos junto ao tronco.']::text[]),
('crossover-polia', ARRAY['Posicione as duas polias acima da altura da cabeça.','Iguale a carga dos dois lados antes de começar.','Dê um passo à frente para criar tensão inicial.']::text[]),
('face-pull', ARRAY['Ajuste a polia na altura do rosto.','Prenda a corda e segure com pegada neutra, palmas para dentro.']::text[]),
('abdominal-polia', ARRAY['Prenda a corda na polia alta.','Ajoelhe-se a um passo da máquina, com a corda ao lado da cabeça.']::text[]),
('elevacao-pelvica', ARRAY['Posicione o banco na altura das escápulas.','Coloque uma almofada ou colchonete sobre a barra antes de apoiá-la no quadril.','Ajuste os pés na largura do quadril, próximos o suficiente para o joelho ficar a 90° no topo.']::text[])

) as v(slug, steps)
where e.slug = v.slug;

-- ── 4. Notas de segurança ───────────────────────────────────
-- Só onde há risco real de lesão ou de ficar preso sob a carga.

update public.exercises e
set safety_notes = v.note
from (values

('supino-reto-barra', 'Com carga alta, use os pinos de segurança do rack ou peça a alguém para acompanhar. Se falhar sem ajuda, incline a barra até um dos lados e deixe as anilhas escorregarem — nunca role a barra em direção ao pescoço.'),
('supino-declinado-barra', 'A posição declinada dificulta o resgate na falha. Peça ajuda para tirar e recolocar a barra no suporte.'),
('agachamento-livre-barra', 'Regule os pinos de segurança na altura do seu ponto mais baixo. Se falhar, deixe a barra cair para trás e saia à frente — por isso o agachamento é feito dentro do rack.'),
('levantamento-terra', 'Interrompa a série assim que a lombar arredondar: é o sinal de que a carga passou do seu controle. Cinto não substitui técnica.'),
('terra-romeno', 'A amplitude é limitada pela sua flexibilidade, não pela carga. Descer além do ponto em que a lombar se mantém neutra é o que machuca.'),
('stiff-halteres', 'Pare de descer quando sentir que a lombar vai arredondar, mesmo que os halteres estejam longe do chão.'),
('desenvolvimento-militar-barra', 'Se sentir dor na frente do ombro, troque pela versão sentada com halteres, que permite girar os punhos livremente.'),
('remada-alta-barra', 'Estalos ou dor no ombro são motivo para substituir pelo face pull ou pela elevação lateral.'),
('mergulho-paralelas', 'Dor na frente do ombro no ponto mais baixo significa que você desceu demais. Reduza a amplitude antes de reduzir a carga.'),
('barra-fixa', 'Não solte a barra de uma vez no fim da série: desça controlando até estender os braços e só então solte.'),
('elevacao-pernas-barra', 'Se a lombar começar a arquear ou o corpo balançar, encerre a série — o abdômen já saiu do movimento.'),
('elevacao-pelvica', 'Sempre use uma almofada entre a barra e o quadril. Com carga alta, monte a barra sobre o corpo já sentado no chão.'),
('agachamento-bulgaro', 'Faça as primeiras sessões sem peso: o exercício exige equilíbrio antes de exigir carga.')

) as v(slug, note)
where e.slug = v.slug;

-- ── 5. Verificação (opcional) ───────────────────────────────
--   select count(*) filter (where cardinality(common_mistakes) = 0) as sem_erros_comuns,
--          count(*) filter (where breathing is null) as sem_respiracao,
--          count(*) filter (where tempo is null) as sem_cadencia
--   from public.exercises;
