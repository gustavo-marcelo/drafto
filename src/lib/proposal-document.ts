export type ProposalDocumentItem = {
  title: string;
  description?: string | null;
};

export type ProposalDocumentPayment = {
  dueDate: string;
  amount: number;
};

export type ProposalDocumentScheduleItem = {
  date: string;
  title: string;
  description?: string | null;
};

export type ProposalDocumentClient = {
  name: string;
  address?: string | null;
  document?: string | null;
  contact?: string | null;
  clientCode?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type ProposalDocumentSettings = {
  logo?: string | null;
  companyName?: string | null;
  tagline?: string | null;
  responsible?: string | null;
  responsibleRole?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type ProposalDocument = {
  code?: string | null;
  title: string;
  subtitle?: string | null;
  eventDate?: string | null;
  issuedAt?: string | null;
  location?: string | null;
  audience?: string | null;
  solution?: string | null;
  validUntil?: string | null;
  paymentMethod?: string | null;
  includedCosts?: string | null;
  requirements?: string | null;
  disclaimer?: string | null;
  acceptanceNote?: string | null;
  totalAmount?: number | null;
  client: ProposalDocumentClient | null;
  modules: ProposalDocumentItem[];
  infrastructure: ProposalDocumentItem[];
  payments: ProposalDocumentPayment[];
  schedule: ProposalDocumentScheduleItem[];
  settings: ProposalDocumentSettings;
};
