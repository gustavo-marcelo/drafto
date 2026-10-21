import { describe, expect, it } from "vitest";

import type { ClientOption } from "@/lib/validations/client";
import type { WizardData } from "@/lib/validations/wizard";

import { wizardToDocument } from "@/lib/proposal-document-wizard";

function baseWizard(overrides: Partial<WizardData> = {}): WizardData {
  return {
    title: "Lançamento Brasília",
    subtitle: "",
    eventDate: "",
    issuedAt: "",
    location: "",
    audience: "",
    clientId: "",
    solution: "",
    modules: [],
    infrastructure: [],
    valueItems: [],
    packageId: "",
    paymentMethod: "",
    validUntil: "",
    includedCosts: "",
    payments: [],
    requirements: "",
    disclaimer: "",
    acceptanceNote: "",
    schedule: [],
    ...overrides,
  };
}

describe("wizardToDocument", () => {
  it("mapeia campos básicos e usa null para vazios", () => {
    const doc = wizardToDocument(baseWizard({ solution: "  " }), null);

    expect(doc.title).toBe("Lançamento Brasília");
    expect(doc.subtitle).toBeNull();
    expect(doc.solution).toBeNull();
    expect(doc.code).toBeNull();
    expect(doc.totalAmount).toBeNull();
  });

  it("faz trim de espaços em campos de texto", () => {
    const doc = wizardToDocument(baseWizard({ solution: "  Sistema completo  " }), null);
    expect(doc.solution).toBe("Sistema completo");
  });

  it("mapeia cliente quando informado", () => {
    const client: ClientOption = { id: "c1", name: "Empresa Exemplo", clientCode: "CL0001.0001" };
    const doc = wizardToDocument(baseWizard(), client);

    expect(doc.client).toEqual({ name: "Empresa Exemplo", clientCode: "CL0001.0001" });
  });

  it("usa null quando não há cliente", () => {
    expect(wizardToDocument(baseWizard(), null).client).toBeNull();
  });

  it("propaga totalAmount zero corretamente (não vira null)", () => {
    const doc = wizardToDocument(baseWizard({ totalAmount: 0 }), null);
    expect(doc.totalAmount).toBe(0);
  });

  it("mapeia módulos, infraestrutura, pagamentos e cronograma", () => {
    const doc = wizardToDocument(
      baseWizard({
        modules: [{ key: "m1", title: "Credenciamento", description: "  " }],
        infrastructure: [
          { key: "totens", title: "Totens de autoatendimento", description: " 5 un. " },
        ],
        payments: [{ dueDate: "2026-11-01", amount: 12500 }],
        schedule: [{ date: "17/11/2026", title: "Montagem", description: "Testes" }],
      }),
      null,
    );

    expect(doc.modules).toEqual([{ title: "Credenciamento", description: null }]);
    expect(doc.infrastructure).toEqual([
      { title: "Totens de autoatendimento", description: "5 un." },
    ]);
    expect(doc.payments).toEqual([{ dueDate: "2026-11-01", amount: 12500 }]);
    expect(doc.schedule).toEqual([
      { date: "17/11/2026", title: "Montagem", description: "Testes" },
    ]);
  });

  it("mapeia a composição do valor com subtotal calculado", () => {
    const doc = wizardToDocument(
      baseWizard({
        valueItems: [
          { description: "Licença e painel", quantity: 2, unitValue: 1500 },
          { description: "Suporte presencial", quantity: 1, unitValue: 800 },
        ],
      }),
      null,
    );

    expect(doc.valueItems).toEqual([
      { description: "Licença e painel", quantity: 2, unitValue: 1500, subtotal: 3000 },
      { description: "Suporte presencial", quantity: 1, unitValue: 800, subtotal: 800 },
    ]);
  });

  it("injeta settings quando fornecidas", () => {
    const doc = wizardToDocument(baseWizard(), null, { companyName: "Espalha.ai" });
    expect(doc.settings).toEqual({ companyName: "Espalha.ai" });
  });

  it("usa settings vazio por padrão", () => {
    expect(wizardToDocument(baseWizard(), null).settings).toEqual({});
  });
});
