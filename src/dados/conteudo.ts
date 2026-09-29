// Conteúdo compartilhado entre a home (resumo) e as páginas internas (detalhe).

export const CONTATO = {
  email: 'suporte.triarii@gmail.com',
  whatsapp: 'https://wa.me/5500000000000',
};

export const NAVEGACAO = [
  { href: '/servicos', rotulo: 'Serviços' },
  { href: '/quando-nos-chamar', rotulo: 'Quando nos chamar' },
  { href: '/como-trabalhamos', rotulo: 'Como trabalhamos' },
  { href: '/sobre', rotulo: 'Sobre' },
];

export interface Servico {
  tag: string;
  nome: string;
  descricao: string;
  itens: string[];
  recebe: string;
  rotuloTecnologias: string;
  tecnologias: string[];
}

// REVISAR: confirme as tecnologias com o time técnico.
export const SERVICOS: Servico[] = [
  {
    tag: '/dev',
    nome: 'Desenvolvimento',
    descricao: 'Sistemas sob medida, do primeiro protótipo à versão que aguenta milhares de usuários.',
    itens: [
      'Sistemas web e portais',
      'APIs e integrações entre sistemas',
      'Aplicativos mobile',
      'Modernização de sistemas legados',
    ],
    recebe: 'Código no seu repositório, testes automatizados, documentação e o sistema publicado.',
    rotuloTecnologias: 'Tecnologias',
    tecnologias: ['TypeScript', 'React', 'Node.js', 'Python', '.NET', 'Flutter'],
  },
  {
    tag: '/infra',
    nome: 'Infraestrutura',
    descricao: 'Ambientes em nuvem estáveis, seguros e com um custo que você consegue explicar.',
    itens: [
      'Migração para AWS, Azure ou Google Cloud',
      'CI/CD e automação de deploy',
      'Monitoramento e alertas',
      'Revisão de custos de nuvem',
    ],
    recebe: 'Ambiente descrito em código, pipeline de deploy, painel de monitoramento e relatório de custos.',
    rotuloTecnologias: 'Tecnologias',
    tecnologias: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
  },
  {
    tag: '/dados',
    nome: 'Dados',
    descricao: 'Dados espalhados viram números confiáveis, no lugar onde a decisão é tomada.',
    itens: [
      'Pipelines e integração de fontes',
      'Data warehouse',
      'Dashboards e BI',
      'Qualidade e governança de dados',
    ],
    recebe: 'Pipelines documentados, uma base única de dados e painéis prontos para a diretoria.',
    rotuloTecnologias: 'Tecnologias',
    tecnologias: ['SQL', 'Python', 'Airflow', 'dbt', 'BigQuery', 'Power BI'],
  },
  {
    tag: '/consultoria',
    nome: 'Consultoria',
    descricao: 'Uma segunda opinião técnica antes de gastar, contratar ou reescrever.',
    itens: [
      'Arquitetura e escolha de tecnologia',
      'Diagnóstico de projetos atrasados',
      'Avaliação técnica para investimento ou aquisição',
      'Segurança e adequação à LGPD',
    ],
    recebe: 'Um relatório com diagnóstico, riscos e um plano priorizado, apresentado ao time e à diretoria.',
    rotuloTecnologias: 'Áreas',
    tecnologias: ['Arquitetura', 'Nuvem', 'Segurança', 'LGPD'],
  },
];

export interface Situacao {
  frase: string;
  resposta: string;
  naHome: boolean;
}

export const SITUACOES: Situacao[] = [
  {
    frase: 'O sistema funciona, mas ninguém tem coragem de mexer.',
    resposta: 'Mapeamos o legado, cobrimos com testes e modernizamos por partes, sem parar a operação.',
    naHome: true,
  },
  {
    frase: 'A conta da nuvem dobrou e ninguém sabe por quê.',
    resposta: 'Auditamos o ambiente, cortamos o desperdício e deixamos o custo visível para o time.',
    naHome: true,
  },
  {
    frase: 'Cada área tem um número diferente para a mesma coisa.',
    resposta:
      'Unificamos as fontes em uma base única e montamos os painéis que a diretoria vai usar de verdade.',
    naHome: true,
  },
  {
    frase: 'O projeto atrasou e o fornecedor sumiu.',
    resposta:
      'Assumimos o código, fazemos um diagnóstico honesto e apresentamos um plano realista para retomar a entrega.',
    naHome: true,
  },
  // REVISAR: confirme que são trabalhos que a Triarii oferece.
  {
    frase: 'O site cai toda vez que a campanha vai ao ar.',
    resposta:
      'Encontramos o gargalo, preparamos a infraestrutura para escalar e colocamos alertas antes do próximo pico.',
    naHome: false,
  },
  {
    frase: 'Precisamos de um sistema novo e não sabemos por onde começar.',
    resposta:
      'Começamos com um diagnóstico curto e um protótipo para validar a ideia antes do investimento maior.',
    naHome: false,
  },
];

export interface Etapa {
  nome: string;
  resumo: string;
  recebe: string[];
}

export const ETAPAS: Etapa[] = [
  {
    nome: 'Diagnóstico',
    resumo:
      'Conversamos com o time e olhamos código, infraestrutura e dados. Você recebe um relatório com o que encontramos.',
    recebe: ['Relatório do que encontramos', 'Riscos em ordem de prioridade', 'Recomendação do que fazer primeiro'],
  },
  {
    nome: 'Plano',
    resumo: 'Escopo, prazo e custo por etapa, antes de qualquer linha de código.',
    recebe: ['Escopo dividido em etapas', 'Prazo e custo de cada etapa', 'O que define cada entrega como pronta'],
  },
  {
    nome: 'Entrega em ciclos',
    resumo: 'Uma demonstração a cada duas semanas. Você acompanha o sistema funcionando, não slides.',
    recebe: [
      'Demonstração a cada duas semanas',
      'Acesso ao ambiente de testes',
      'Resumo do que foi feito e do que vem a seguir',
    ],
  },
  {
    nome: 'Sustentação',
    resumo:
      'Seguimos monitorando e evoluindo, ou passamos o bastão para o seu time com tudo documentado.',
    recebe: ['Monitoramento e correções', 'Evoluções planejadas', 'Documentação para o seu time assumir'],
  },
];

export interface Principio {
  titulo: string;
  texto: string;
}

export const COMO_ENTRAMOS: Principio[] = [
  {
    titulo: 'Diagnóstico antes da solução',
    texto: 'Olhamos o que existe antes de propor qualquer coisa. Muitas vezes o problema não está onde parece.',
  },
  {
    titulo: 'Sem parar a operação',
    texto:
      'Mudamos por partes, sempre com um caminho de volta, para o negócio seguir funcionando enquanto a gente arruma.',
  },
  {
    titulo: 'Tudo à vista',
    texto:
      'Você sabe o que está sendo feito, quanto custa e o que vem depois. Nada fica só na cabeça de uma pessoa.',
  },
];

export const NO_QUE_ACREDITAMOS: Principio[] = [
  {
    titulo: 'Menos promessa, mais presença',
    texto:
      'Preferimos prometer pouco e estar perto quando o problema aparece a vender uma apresentação bonita.',
  },
  {
    titulo: 'Custo e prazo à vista',
    texto:
      'Cada etapa tem escopo, prazo e custo definidos antes de começar. Se algo mudar, você fica sabendo na hora.',
  },
  {
    titulo: 'Nada de dependência',
    texto:
      'Documentamos o que fazemos para que o seu time consiga seguir sem a gente, se um dia preferir.',
  },
];

// REVISAR: confirme as respostas com a diretoria antes de publicar.
export const PERGUNTAS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: 'Vocês assumem um projeto que outro fornecedor começou?',
    resposta:
      'Sim. Começamos pelo diagnóstico do que já existe e dizemos com clareza o que dá para aproveitar e o que precisa ser refeito.',
  },
  {
    pergunta: 'Preciso ter um time técnico na empresa?',
    resposta:
      'Não. Se você tiver, trabalhamos junto com ele. Se não tiver, cuidamos da parte técnica e explicamos as decisões em linguagem de negócio.',
  },
  {
    pergunta: 'Como funciona a cobrança?',
    resposta:
      'Depende do tipo de trabalho. Definimos junto no plano, antes de começar, e o valor de cada etapa fica claro desde o início.',
  },
  {
    pergunta: 'E se eu quiser parar no meio?',
    resposta:
      'Cada etapa termina com algo entregue e documentado. Se decidir parar, você fica com tudo o que foi feito até ali.',
  },
];
