import type { ClientOption } from "@/lib/validations/client";
import type { WizardData } from "@/lib/validations/wizard";

import type { ProposalDocument, ProposalDocumentSettings } from "@/lib/proposal-document";

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function wizardToDocument(
  data: WizardData,
  client: ClientOption | null,
  settings: ProposalDocumentSettings = {},
): ProposalDocument {
  return {
    code: null,
    title: data.title,
    subtitle: emptyToNull(data.subtitle),
    eventDate: emptyToNull(data.eventDate),
    issuedAt: emptyToNull(data.issuedAt),
    location: emptyToNull(data.location),
    audience: emptyToNull(data.audience),
    solution: emptyToNull(data.solution),
    validUntil: emptyToNull(data.validUntil),
    paymentMethod: emptyToNull(data.paymentMethod),
    includedCosts: emptyToNull(data.includedCosts),
    requirements: emptyToNull(data.requirements),
    disclaimer: emptyToNull(data.disclaimer),
    acceptanceNote: emptyToNull(data.acceptanceNote),
    totalAmount: data.totalAmount ?? null,
    client: client
      ? {
          name: client.name,
          clientCode: client.clientCode ?? null,
          document: client.document ?? null,
          address: client.address ?? null,
          contact: client.contact ?? null,
          phone: client.phone ?? null,
          email: client.email ?? null,
        }
      : null,
    modules: data.modules.map((module) => ({
      title: module.title,
      description: emptyToNull(module.description),
    })),
    infrastructure: data.infrastructure.map((item) => ({
      title: item.title,
      description: emptyToNull(item.description),
    })),
    valueItems: data.valueItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitValue: item.unitValue,
      subtotal: item.quantity * item.unitValue,
    })),
    payments: data.payments.map((payment) => ({
      dueDate: payment.dueDate,
      amount: payment.amount,
    })),
    schedule: data.schedule.map((item) => ({
      date: item.date,
      title: item.title,
      description: emptyToNull(item.description),
    })),
    settings,
  };
}
