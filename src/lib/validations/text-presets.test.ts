import { describe, expect, it } from "vitest";

import { textPresetSchema } from "@/lib/validations/text-presets";

describe("textPresetSchema", () => {
  it("aceita dados válidos e aplica trim", () => {
    const result = textPresetSchema.safeParse({
      category: "solution",
      title: "  Solução padrão  ",
      content: "  Texto da solução  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Solução padrão");
      expect(result.data.content).toBe("Texto da solução");
    }
  });

  it("rejeita categoria fora do enum", () => {
    const result = textPresetSchema.safeParse({
      category: "invalida",
      title: "x",
      content: "y",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Categoria inválida.");
    }
  });

  it("rejeita título vazio", () => {
    const result = textPresetSchema.safeParse({
      category: "solution",
      title: "   ",
      content: "conteúdo",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe um nome para o texto.");
    }
  });

  it("rejeita título com mais de 80 caracteres", () => {
    const result = textPresetSchema.safeParse({
      category: "solution",
      title: "a".repeat(81),
      content: "conteúdo",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nome muito longo (máx. 80 caracteres).");
    }
  });

  it("rejeita conteúdo vazio", () => {
    const result = textPresetSchema.safeParse({
      category: "solution",
      title: "título",
      content: "  ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("O texto não pode ficar vazio.");
    }
  });

  it("rejeita conteúdo com mais de 10.000 caracteres", () => {
    const result = textPresetSchema.safeParse({
      category: "solution",
      title: "título",
      content: "a".repeat(10_001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Texto muito longo (máx. 10.000 caracteres).");
    }
  });

  it("aceita o limite exato de 80 e 10.000 caracteres", () => {
    const result = textPresetSchema.safeParse({
      category: "disclaimer",
      title: "a".repeat(80),
      content: "a".repeat(10_000),
    });
    expect(result.success).toBe(true);
  });
});
