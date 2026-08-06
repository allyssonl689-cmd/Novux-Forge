export interface LegalSection {
  title: string;
  body: string;
}

export const TERMS_UPDATED_AT = '06 de agosto de 2026';
export const PRIVACY_UPDATED_AT = '06 de agosto de 2026';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. Aceitação dos termos',
    body:
      'Ao criar uma conta e usar o Novux Forge, você concorda com estes Termos de Uso e com a ' +
      'nossa Política de Privacidade. Se não concordar, não utilize o aplicativo.',
  },
  {
    title: '2. O que é o Novux Forge',
    body:
      'O Novux Forge é um aplicativo de acompanhamento de treinos de musculação: fichas de ' +
      'treino, histórico, progressão de carga, peso corporal e orientações de execução de ' +
      'exercícios. Ele não substitui a avaliação de um profissional de educação física, ' +
      'nutricionista ou médico. As sugestões de carga, séries e repetições são orientações ' +
      'gerais para iniciantes — consulte um profissional antes de iniciar qualquer programa de ' +
      'exercícios, especialmente se você tiver condições de saúde preexistentes.',
  },
  {
    title: '3. Sua conta',
    body:
      'Você é responsável por manter a confidencialidade da sua senha e por todas as atividades ' +
      'realizadas na sua conta. Avise-nos se suspeitar de acesso não autorizado. Os dados que você ' +
      'cadastra (nome, e-mail, peso, fotos de progresso, treinos) são seus — você pode exportá-los ' +
      '(histórico em CSV) ou excluí-los a qualquer momento pelo próprio app.',
  },
  {
    title: '4. Conteúdo que você envia',
    body:
      'Fotos de progresso e outras informações que você cadastra continuam sendo suas. Elas ficam ' +
      'em um armazenamento privado, visível só para você — o Novux Forge não compartilha, publica ' +
      'ou usa essas fotos para nenhuma outra finalidade além de exibi-las de volta para você dentro ' +
      'do app.',
  },
  {
    title: '5. Uso aceitável',
    body:
      'Não use o app para fins ilegais, para tentar acessar dados de outros usuários, ou para ' +
      'sobrecarregar deliberadamente nossa infraestrutura. Contas usadas de forma abusiva podem ser ' +
      'suspensas.',
  },
  {
    title: '6. Limitação de responsabilidade',
    body:
      'O Novux Forge é fornecido "como está". Fazemos o possível para manter o serviço no ar e os ' +
      'dados corretos, mas não garantimos disponibilidade ininterrupta nem nos responsabilizamos ' +
      'por lesões ou danos resultantes da prática de exercícios físicos — a decisão e a execução ' +
      'são sempre suas, com o acompanhamento adequado.',
  },
  {
    title: '7. Cancelamento',
    body:
      'Você pode parar de usar o app quando quiser. Em Configurações, "Resetar conta" apaga seu ' +
      'histórico e fichas mantendo o login; "Excluir minha conta" apaga tudo permanentemente, ' +
      'incluindo o login — essa segunda opção não pode ser desfeita.',
  },
  {
    title: '8. Alterações nestes termos',
    body:
      'Podemos atualizar estes termos eventualmente. Alterações relevantes serão comunicadas dentro ' +
      'do app. O uso continuado após uma atualização representa sua aceitação dos novos termos.',
  },
  {
    title: '9. Contato',
    body: 'Dúvidas sobre estes termos podem ser enviadas para contato@novuxforge.com.',
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Quais dados coletamos',
    body:
      'E-mail e senha (autenticação); nome de exibição; peso corporal e fotos de progresso, quando ' +
      'você optar por registrá-los; respostas do questionário inicial (objetivo, experiência, dias ' +
      'de treino, equipamento disponível); fichas de treino e histórico de séries, repetições, ' +
      'carga e RPE registrados durante os treinos.',
  },
  {
    title: '2. Por que coletamos',
    body:
      'Para viabilizar o próprio funcionamento do app: manter sua conta, montar e acompanhar seus ' +
      'treinos, calcular seu progresso (score, volume, estimativa de força) e permitir a ' +
      'comparação de fotos de progresso ao longo do tempo. Não usamos seus dados para publicidade ' +
      'nem os vendemos a terceiros.',
  },
  {
    title: '3. Base legal (LGPD)',
    body:
      'Tratamos seus dados com base na execução do contrato de uso do app (Lei 13.709/2018, art. ' +
      '7º, V) e, quando aplicável, no seu consentimento explícito — por exemplo, ao optar por ' +
      'registrar uma foto de progresso ou o peso corporal, campos que são sempre opcionais.',
  },
  {
    title: '4. Onde seus dados ficam armazenados',
    body:
      'Usamos o Supabase (banco de dados Postgres com controle de acesso por linha — cada usuário só ' +
      'acessa os próprios dados) como operador de dados. Fotos de progresso ficam num bucket de ' +
      'armazenamento privado, também restrito ao seu próprio usuário. As imagens dos exercícios do ' +
      'catálogo vêm de um banco de dados público de exercícios (Free Exercise DB) — essa consulta ' +
      'não envia nenhum dado pessoal seu, só o identificador do exercício.',
  },
  {
    title: '5. Compartilhamento com terceiros',
    body:
      'Não compartilhamos seus dados pessoais com terceiros para fins de marketing. Serviços de ' +
      'infraestrutura (como o Supabase) têm acesso aos dados apenas na medida necessária para operar ' +
      'o app, sob contrato de confidencialidade.',
  },
  {
    title: '6. Seus direitos',
    body:
      'Você pode a qualquer momento: exportar seu histórico de treinos em CSV (tela Histórico); ' +
      'corrigir nome e peso corporal (tela Perfil); apagar histórico e fichas mantendo o login ' +
      '("Resetar conta" em Configurações); ou excluir permanentemente sua conta e todos os dados ' +
      'associados, incluindo o login ("Excluir minha conta" em Configurações). Esses caminhos ' +
      'cobrem os direitos de acesso, correção e eliminação previstos na LGPD (art. 18).',
  },
  {
    title: '7. Retenção',
    body:
      'Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, os dados são apagados ' +
      'permanentemente do banco de dados e do armazenamento de fotos — essa exclusão não pode ser ' +
      'desfeita.',
  },
  {
    title: '8. Contato do controlador',
    body:
      'Para exercer seus direitos de titular de dados ou tirar dúvidas sobre esta política, escreva ' +
      'para contato@novuxforge.com.',
  },
  {
    title: '9. Alterações nesta política',
    body:
      'Podemos atualizar esta política eventualmente. Alterações relevantes serão comunicadas dentro ' +
      'do app.',
  },
];
