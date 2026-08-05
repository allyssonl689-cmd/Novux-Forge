/**
 * Glossário de academia. Conteúdo estático do app — não vale uma tabela no
 * banco: muda pouco e precisa estar disponível offline, no meio do treino.
 */

export interface GlossaryTerm {
  term: string;
  short: string;
  full: string;
  /** Termos relacionados, por `term` */
  related?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Repetição',
    short: 'Uma execução completa do movimento',
    full: 'Uma repetição é o movimento completo, da posição inicial até o fim e de volta. No supino, descer a barra e empurrar de volta é uma repetição. Costuma ser abreviada como "rep".',
    related: ['Série', 'Amplitude'],
  },
  {
    term: 'Série',
    short: 'Um bloco de repetições seguidas',
    full: 'Série é um conjunto de repetições feitas sem parar. "3 séries de 10" significa fazer 10 repetições, descansar, e repetir isso mais duas vezes.',
    related: ['Repetição', 'Descanso'],
  },
  {
    term: 'Carga',
    short: 'O peso usado no exercício',
    full: 'É quanto peso você está levantando, em quilos. Em exercícios de peso corporal (flexão, barra fixa), a carga é o próprio corpo — por isso o app aceita séries sem peso registrado.',
    related: ['Sobrecarga progressiva'],
  },
  {
    term: 'Descanso',
    short: 'A pausa entre séries',
    full: 'Tempo de pausa entre uma série e a próxima. Exercícios pesados e compostos pedem 2 a 3 minutos; isolamentos leves, 45 a 60 segundos. Descansar de menos derruba as repetições da série seguinte.',
    related: ['Série', 'Exercício composto'],
  },
  {
    term: 'Amplitude',
    short: 'O quanto o movimento percorre',
    full: 'É a distância que a articulação percorre na repetição. Amplitude completa costuma dar mais resultado que carga alta com meio movimento — é o erro mais comum de quem está começando.',
  },
  {
    term: 'Cadência',
    short: 'A velocidade de cada fase',
    full: 'A notação 2-0-1-0 significa: 2 segundos descendo, 0 de pausa embaixo, 1 segundo subindo, 0 de pausa em cima. Controlar a descida é o que mais diferencia treino bem feito de peso jogado.',
    related: ['Excêntrica', 'Concêntrica'],
  },
  {
    term: 'Excêntrica',
    short: 'A fase em que o músculo alonga',
    full: 'É a fase de descida na maioria dos exercícios — descer a barra no supino, descer no agachamento. É a fase que mais gera adaptação, e por isso deve ser controlada, nunca deixada cair.',
    related: ['Concêntrica', 'Cadência'],
  },
  {
    term: 'Concêntrica',
    short: 'A fase em que o músculo encurta',
    full: 'É a fase de esforço, quando você vence a carga: empurrar a barra, subir do agachamento, puxar na barra fixa.',
    related: ['Excêntrica', 'Cadência'],
  },
  {
    term: 'RPE',
    short: 'O quanto a série foi difícil, de 1 a 10',
    full: 'Escala de esforço percebido. RPE 10 é falha total: não sairia nem mais uma repetição. RPE 8 significa que ainda dariam 2 repetições. Para iniciante, treinar entre RPE 7 e 8 traz quase todo o resultado com muito menos risco.',
    related: ['Falha'],
  },
  {
    term: 'Falha',
    short: 'Quando não sai mais nenhuma repetição',
    full: 'É o ponto em que você não consegue completar outra repetição com técnica. Não é necessário treinar até a falha em todas as séries — em exercícios pesados com barra, é onde acontece a maioria dos acidentes.',
    related: ['RPE'],
  },
  {
    term: 'Aquecimento',
    short: 'Séries leves antes das séries valendo',
    full: 'Uma ou duas séries com pouco peso para preparar a articulação e ensaiar o movimento. No app, marque a série tocando no número dela: séries de aquecimento não contam no volume total.',
    related: ['Volume'],
  },
  {
    term: 'Volume',
    short: 'Peso × repetições somados',
    full: 'É a conta de quanto trabalho você fez: carga multiplicada por repetições, somando todas as séries. É a métrica que o app mostra no histórico e o principal indicador de progresso a médio prazo.',
    related: ['Sobrecarga progressiva'],
  },
  {
    term: 'Sobrecarga progressiva',
    short: 'Aumentar a exigência com o tempo',
    full: 'É o princípio central da musculação: para o corpo continuar mudando, o estímulo precisa crescer. Isso vem de mais carga, mais repetições ou melhor execução — nem sempre de mais peso.',
    related: ['Carga', 'Volume'],
  },
  {
    term: 'Exercício composto',
    short: 'Move mais de uma articulação',
    full: 'Agachamento, supino, remada e terra são compostos: recrutam vários músculos ao mesmo tempo. Devem vir no começo do treino, quando você está descansado.',
    related: ['Exercício isolado'],
  },
  {
    term: 'Exercício isolado',
    short: 'Move uma articulação só',
    full: 'Rosca direta, cadeira extensora e elevação lateral são isolados: focam um músculo. Entram no fim do treino e pedem carga menor com execução mais controlada.',
    related: ['Exercício composto'],
  },
  {
    term: 'Ficha',
    short: 'A lista de exercícios de um dia',
    full: 'É o roteiro de um treino: quais exercícios, quantas séries, quantas repetições e quanto descanso. No app, cada dia da sua divisão vira uma ficha.',
    related: ['Divisão'],
  },
  {
    term: 'Divisão',
    short: 'Como os treinos se espalham na semana',
    full: 'É a forma de distribuir os grupos musculares nos dias. ABC treina peito/ombro, costas/bíceps e pernas em dias separados; corpo inteiro trabalha tudo em cada sessão. Iniciante rende mais com corpo inteiro.',
    related: ['Ficha'],
  },
  {
    term: 'PR',
    short: 'Seu recorde pessoal em um exercício',
    full: 'Personal record: a maior carga que você já levantou naquele exercício. O app marca automaticamente quando você supera a sua melhor marca.',
  },
  {
    term: 'Drop-set',
    short: 'Reduzir a carga e continuar sem descanso',
    full: 'Ao chegar na falha, você tira peso na hora e continua a série. É uma técnica avançada de intensificação — não é necessária para quem está começando.',
    related: ['Falha'],
  },
  {
    term: 'Isometria',
    short: 'Sustentar a posição sem se mover',
    full: 'Exercícios como a prancha não têm repetições: você sustenta a posição por tempo. Nesses casos, registre segundos no lugar de repetições.',
  },
];

export function findTerm(term: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.term.toLowerCase() === term.toLowerCase());
}
