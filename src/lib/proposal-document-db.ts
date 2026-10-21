import type { ProposalDocument, ProposalDocumentSettings } from "@/lib/proposal-document";
import { formatAddress } from "@/lib/format";

type ProposalPayload = {
  paymentMethod?: string | null;
  includedCosts?: string | null;
  requirements?: string | null;
  disclaimer?: string | null;
  acceptanceNote?: string | null;
};

type DecimalLike = { toNumber(): number };

type DocumentSourceProposal = {
  code: string | null;
  title: string;
  subtitle: string | null;
  eventDate: Date | null;
  issuedAt: Date | null;
  location: string | null;
  audience: string | null;
  solution: string | null;
  validUntil: Date | null;
  totalAmount: DecimalLike | null;
  payload: unknown;
  client: {
    name: string;
    street: string | null;
    number: string | null;
    complement: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    document: string | null;
    contact: string | null;
    clientCode: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  modules: { title: string; description: string | null }[];
  equipment: { name: string; description: string | null; quantity: number; specs: string | null }[];
  payments: { dueDate: Date; amount: DecimalLike }[];
  schedule: { date: string; title: string; description: string | null }[];
};

export function proposalToDocument(
  proposal: DocumentSourceProposal,
  settings: ProposalDocumentSettings = {},
): ProposalDocument {
  const payload = (proposal.payload ?? {}) as ProposalPayload;

  return {
    code: proposal.code,
    title: proposal.title,
    subtitle: proposal.subtitle,
    eventDate: proposal.eventDate ? proposal.eventDate.toISOString() : null,
    issuedAt: proposal.issuedAt ? proposal.issuedAt.toISOString() : null,
    location: proposal.location,
    audience: proposal.audience,
    solution: proposal.solution,
    validUntil: proposal.validUntil ? proposal.validUntil.toISOString() : null,
    paymentMethod: payload.paymentMethod ?? null,
    includedCosts: payload.includedCosts ?? null,
    requirements: payload.requirements ?? null,
    disclaimer: payload.disclaimer ?? null,
    acceptanceNote: payload.acceptanceNote ?? null,
    totalAmount: proposal.totalAmount ? proposal.totalAmount.toNumber() : null,
    client: proposal.client
      ? {
          name: proposal.client.name,
          address: formatAddress(proposal.client) || null,
          document: proposal.client.document,
          contact: proposal.client.contact,
          clientCode: proposal.client.clientCode,
          phone: proposal.client.phone,
          email: proposal.client.email,
        }
      : null,
    modules: proposal.modules.map((module) => ({
      title: module.title,
      description: module.description,
    })),
    equipment: proposal.equipment.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      specs: item.specs,
    })),
    payments: proposal.payments.map((payment) => ({
      dueDate: payment.dueDate.toISOString(),
      amount: payment.amount.toNumber(),
    })),
    schedule: proposal.schedule.map((item) => ({
      date: item.date,
      title: item.title,
      description: item.description,
    })),
    settings,
  };
}
