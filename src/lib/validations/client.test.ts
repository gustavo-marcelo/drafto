import { describe, expect, it } from "vitest";

import { clientSchema } from "@/lib/validations/client";

describe("clientSchema", () => {
  it("aceita dados válidos e aplica trim", () => {
    const result = clientSchema.safeParse({
      name: "  Empresa Exemplo LTDA  ",
      zipCode: " 70000-000 ",
      street: " SHS Quadra 6 ",
      number: " S/N ",
      complement: " Bloco C ",
      city: " Brasília ",
      state: " df ",
      document: " 00.000.000/0001-00 ",
      contact: " Maria Souza ",
      phone: " (61) 98765-4321 ",
      email: " contato@exemplo.com ",
      clientCode: " CL1909.0180 ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Empresa Exemplo LTDA");
      expect(result.data.zipCode).toBe("70000-000");
      expect(result.data.street).toBe("SHS Quadra 6");
      expect(result.data.city).toBe("Brasília");
      expect(result.data.state).toBe("df");
      expect(result.data.email).toBe("contato@exemplo.com");
    }
  });

  it("rejeita nome curto", () => {
    const result = clientSchema.safeParse({ name: "E" });
    expect(result.success).toBe(false);
  });

  it("aceita endereço em branco (usa padrão vazio)", () => {
    const result = clientSchema.safeParse({ name: "Empresa Exemplo" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zipCode).toBe("");
      expect(result.data.street).toBe("");
      expect(result.data.city).toBe("");
      expect(result.data.state).toBe("");
    }
  });

  it("rejeita UF que não tem 2 letras", () => {
    const result = clientSchema.safeParse({ name: "Empresa Exemplo", state: "Distrito Federal" });
    expect(result.success).toBe(false);
  });

  it("aceita UF vazia", () => {
    const result = clientSchema.safeParse({ name: "Empresa Exemplo", state: "" });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido quando informado", () => {
    const result = clientSchema.safeParse({ name: "Empresa Exemplo", email: "nao-email" });
    expect(result.success).toBe(false);
  });
});
