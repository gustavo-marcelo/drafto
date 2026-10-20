import { describe, expect, it } from "vitest";

import { createUserSchema, updateUserSchema } from "@/lib/validations/user";

describe("createUserSchema", () => {
  it("aceita dados válidos, normaliza e-mail e aplica trim no nome", () => {
    const result = createUserSchema.safeParse({
      name: "  Maria Souza  ",
      email: "  Maria@Exemplo.com  ",
      password: "senha1234",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Maria Souza");
      expect(result.data.email).toBe("maria@exemplo.com");
    }
  });

  it("rejeita nome curto", () => {
    const result = createUserSchema.safeParse({
      name: "M",
      email: "maria@exemplo.com",
      password: "senha1234",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Maria",
      email: "nao-email",
      password: "senha1234",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita senha sem número", () => {
    const result = createUserSchema.safeParse({
      name: "Maria",
      email: "maria@exemplo.com",
      password: "senhasemnumero",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita senha curta", () => {
    const result = createUserSchema.safeParse({
      name: "Maria",
      email: "maria@exemplo.com",
      password: "abc123",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("aceita edição sem senha (mantém a atual)", () => {
    const result = updateUserSchema.safeParse({
      name: "Maria Souza",
      email: "Maria@Exemplo.com",
      password: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("maria@exemplo.com");
      expect(result.data.password).toBe("");
    }
  });

  it("aceita senha nova válida", () => {
    const result = updateUserSchema.safeParse({
      name: "Maria",
      email: "maria@exemplo.com",
      password: "senha1234",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita senha nova inválida quando informada", () => {
    const result = updateUserSchema.safeParse({
      name: "Maria",
      email: "maria@exemplo.com",
      password: "curta",
    });

    expect(result.success).toBe(false);
  });
});
