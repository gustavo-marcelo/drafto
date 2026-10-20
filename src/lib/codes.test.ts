import { describe, expect, it } from "vitest";

import { generateCode, generateShareId } from "@/lib/codes";

describe("generateCode", () => {
  it("usa o prefixo informado", () => {
    expect(generateCode("CL")).toMatch(/^CL\d{4}\.\d{4}$/);
    expect(generateCode("PR")).toMatch(/^PR\d{4}\.\d{4}$/);
  });

  it("preenche blocos com zeros à esquerda", () => {
    const code = generateCode("PR");
    const [, first, second] = code.match(/^PR(\d{4})\.(\d{4})$/) ?? [];
    expect(first).toHaveLength(4);
    expect(second).toHaveLength(4);
  });

  it("gera códigos distintos em sequência", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateCode("CL")));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("generateShareId", () => {
  it("respeita o comprimento padrão de 16 caracteres", () => {
    expect(generateShareId()).toHaveLength(16);
  });

  it("respeita comprimento customizado", () => {
    expect(generateShareId(8)).toHaveLength(8);
  });

  it("usa apenas o alfabeto seguro para URL (sem caracteres ambíguos)", () => {
    const id = generateShareId(200);
    expect(id).toMatch(/^[abcdefghijkmnopqrstuvwxyz23456789]+$/);
    expect(id).not.toMatch(/[l01]/);
  });

  it("não repete em gerações sucessivas", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateShareId()));
    expect(ids.size).toBe(100);
  });
});
