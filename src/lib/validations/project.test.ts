import { describe, expect, it } from "vitest";

import { projectDocumentSchema, projectSchema } from "@/lib/validations/project";

describe("projectSchema", () => {
  it("aceita projeto válido e aplica trim", () => {
    const result = projectSchema.safeParse({
      name: "  Projeto de credenciamento  ",
      description: "  Credenciamento do evento de lançamento.  ",
      clientId: "client-1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Projeto de credenciamento");
      expect(result.data.description).toBe("Credenciamento do evento de lançamento.");
    }
  });

  it("rejeita nome curto", () => {
    const result = projectSchema.safeParse({
      name: "P",
      description: "Descrição válida",
      clientId: "client-1",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita descrição vazia", () => {
    const result = projectSchema.safeParse({
      name: "Projeto válido",
      description: "  ",
      clientId: "client-1",
    });

    expect(result.success).toBe(false);
  });

  it("exige cliente vinculado", () => {
    const result = projectSchema.safeParse({
      name: "Projeto válido",
      description: "Descrição válida",
      clientId: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("projectDocumentSchema", () => {
  it("aceita documento Markdown válido", () => {
    const result = projectDocumentSchema.safeParse({
      title: "  Escopo  ",
      content: "# Escopo\n\n- Item 1\n- Item 2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Escopo");
      expect(result.data.content).toContain("# Escopo");
    }
  });

  it("rejeita conteúdo vazio", () => {
    const result = projectDocumentSchema.safeParse({ title: "Escopo", content: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita título curto", () => {
    const result = projectDocumentSchema.safeParse({ title: "A", content: "# Documento" });
    expect(result.success).toBe(false);
  });
});
