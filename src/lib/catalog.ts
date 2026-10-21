export type DefaultResource = {
  key: string;
  title: string;
  description: string;
};

export type DefaultInfrastructure = {
  key: string;
  title: string;
  description: string;
};

export const DEFAULT_RESOURCES: DefaultResource[] = [
  {
    key: "importacao-participantes",
    title: "Importação de participantes",
    description: "Importação de bases em lote para o sistema de credenciamento.",
  },
  {
    key: "etiquetas-personalizadas",
    title: "Etiquetas personalizadas",
    description: "Emissão de etiquetas com identidade visual do evento.",
  },
  {
    key: "identificacao-prioritaria",
    title: "Identificação prioritária",
    description: "Fluxo dedicado para convidados VIP e imprensa.",
  },
  {
    key: "entrega-de-kits",
    title: "Entrega de kits",
    description: "Controle de entrega de kits e materiais por participante.",
  },
  {
    key: "chapelaria",
    title: "Chapelaria",
    description: "Guarda-volumes com controle de retirada e devolução.",
  },
  {
    key: "controle-de-acesso",
    title: "Controle de acesso",
    description: "Validação de entrada por QR Code, CPF ou nome.",
  },
  {
    key: "inscricoes-no-local",
    title: "Inscrições no local",
    description: "Cadastro de participantes na hora, no próprio evento.",
  },
  {
    key: "dashboard-tempo-real",
    title: "Dashboard em tempo real",
    description: "Acompanhamento de fluxo e presença em tempo real.",
  },
];

export const DEFAULT_INFRASTRUCTURES: DefaultInfrastructure[] = [
  {
    key: "totens-de-autoatendimento",
    title: "Totens de autoatendimento",
    description: "Unidades self-service para emissão de credenciais no evento.",
  },
  {
    key: "estacoes-de-impressao",
    title: "Estações de impressão",
    description: "Impressoras para crachás, etiquetas e materiais do participante.",
  },
  {
    key: "estacoes-de-cadastro",
    title: "Estações de cadastro",
    description: "Baias com operador para cadastro e confirmação de participantes.",
  },
  {
    key: "rede-e-conectividade",
    title: "Rede e conectividade",
    description: "Infraestrutura de rede dedicada com redundância para o credenciamento.",
  },
  {
    key: "sala-de-operacao",
    title: "Sala de operação",
    description: "Espaço de coordenação, monitoramento e apoio às equipes de campo.",
  },
  {
    key: "equipe-de-suporte-tecnico",
    title: "Equipe de suporte técnico",
    description: "Profissionais de manutenção em site durante todo o evento.",
  },
];

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
