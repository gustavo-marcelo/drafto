import type { ProposalStatus } from "@/generated/prisma/enums";

export const PROPOSAL_STATUSES: ProposalStatus[] = [
  "DRAFT",
  "SENT",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
];

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviada",
  APPROVED: "Aceita",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  REJECTED: "Recusada",
  EXPIRED: "Expirada",
};

export const STATUS_STYLES: Record<ProposalStatus, string> = {
  DRAFT: "bg-primary-100 text-primary-800",
  SENT: "bg-accent-100 text-accent-900",
  APPROVED: "bg-accent-200 text-accent-900",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};

export const PROPOSAL_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["APPROVED", "REJECTED", "CANCELLED", "DRAFT"],
  APPROVED: ["COMPLETED", "CANCELLED", "SENT"],
  COMPLETED: ["DRAFT"],
  CANCELLED: ["DRAFT"],
  REJECTED: ["DRAFT"],
  EXPIRED: ["DRAFT"],
};

export function canTransition(from: ProposalStatus, to: ProposalStatus): boolean {
  return from === to || PROPOSAL_TRANSITIONS[from].includes(to);
}

export function allowedStatuses(current: ProposalStatus): ProposalStatus[] {
  return PROPOSAL_STATUSES.filter(
    (value) => value === current || PROPOSAL_TRANSITIONS[current].includes(value),
  );
}
