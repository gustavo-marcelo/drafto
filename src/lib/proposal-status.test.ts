import { describe, expect, it } from "vitest";

import type { ProposalStatus } from "@/generated/prisma/enums";

import {
  allowedStatuses,
  canTransition,
  PROPOSAL_STATUSES,
  PROPOSAL_TRANSITIONS,
  STATUS_LABELS,
} from "@/lib/proposal-status";

describe("PROPOSAL_STATUSES / labels", () => {
  it("cobre todos os status com rótulo em pt-BR", () => {
    for (const status of PROPOSAL_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("traduz APPROVED como 'Aceita'", () => {
    expect(STATUS_LABELS.APPROVED).toBe("Aceita");
  });

  it("define transições para todos os status", () => {
    for (const status of PROPOSAL_STATUSES) {
      expect(PROPOSAL_TRANSITIONS[status]).toBeDefined();
    }
  });
});

describe("canTransition", () => {
  it("permite o fluxo feliz DRAFT → SENT → APPROVED → COMPLETED", () => {
    expect(canTransition("DRAFT", "SENT")).toBe(true);
    expect(canTransition("SENT", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "COMPLETED")).toBe(true);
  });

  it("permite recusa e cancelamento a partir de SENT", () => {
    expect(canTransition("SENT", "REJECTED")).toBe(true);
    expect(canTransition("SENT", "CANCELLED")).toBe(true);
  });

  it("bloqueia saltos inválidos", () => {
    expect(canTransition("DRAFT", "APPROVED")).toBe(false);
    expect(canTransition("DRAFT", "COMPLETED")).toBe(false);
    expect(canTransition("SENT", "COMPLETED")).toBe(false);
    expect(canTransition("COMPLETED", "APPROVED")).toBe(false);
  });

  it("nunca permite transição manual para EXPIRED (só automática)", () => {
    for (const status of PROPOSAL_STATUSES) {
      expect(canTransition(status, "EXPIRED")).toBe(status === "EXPIRED");
    }
  });

  it("trata o mesmo status como no-op permitido", () => {
    for (const status of PROPOSAL_STATUSES) {
      expect(canTransition(status, status)).toBe(true);
    }
  });

  it("mantém toda transição declarada no mapa válida (consistência)", () => {
    for (const from of PROPOSAL_STATUSES) {
      for (const to of PROPOSAL_TRANSITIONS[from]) {
        expect(canTransition(from, to)).toBe(true);
      }
    }
  });
});

describe("allowedStatuses", () => {
  it("inclui o status atual como primeira opção conceitual", () => {
    expect(allowedStatuses("DRAFT")).toContain("DRAFT");
  });

  it("para DRAFT oferece exatamente Rascunho/Enviada/Cancelada", () => {
    expect(allowedStatuses("DRAFT").sort()).toEqual(["CANCELLED", "DRAFT", "SENT"].sort());
  });

  it("para SENT oferece 5 opções e nenhuma é Concluída", () => {
    const options = allowedStatuses("SENT");
    expect(options).toHaveLength(5);
    expect(options).not.toContain("COMPLETED");
  });

  it("para APPROVED permite Concluída", () => {
    expect(allowedStatuses("APPROVED")).toContain("COMPLETED");
  });

  it("para COMPLETED permite apenas Concluída + reabrir como Rascunho", () => {
    expect(allowedStatuses("COMPLETED").sort()).toEqual(["COMPLETED", "DRAFT"].sort());
  });

  it("estados terminais permitem reabrir como Rascunho", () => {
    for (const terminal of ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"] as ProposalStatus[]) {
      expect(allowedStatuses(terminal)).toContain("DRAFT");
    }
  });
});
