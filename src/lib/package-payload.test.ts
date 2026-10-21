import { describe, expect, it } from "vitest";

import { parsePackagePayload } from "@/lib/package-payload";

describe("parsePackagePayload", () => {
  it("retorna objeto vazio para payload nulo ou não-objeto", () => {
    expect(parsePackagePayload(null)).toEqual({});
    expect(parsePackagePayload(undefined)).toEqual({});
    expect(parsePackagePayload("texto")).toEqual({});
    expect(parsePackagePayload(42)).toEqual({});
  });

  it("preserva recursos e infraestrutura válidos", () => {
    const payload = {
      recursos: ["controle-de-acesso", "chapelaria"],
      infraestrutura: ["totens-de-autoatendimento"],
    };
    expect(parsePackagePayload(payload)).toEqual(payload);
  });

  it("aceita objeto parcial", () => {
    expect(parsePackagePayload({ recursos: ["a"] })).toEqual({ recursos: ["a"] });
    expect(parsePackagePayload({ infraestrutura: [] })).toEqual({ infraestrutura: [] });
  });

  it("retorna o mesmo objeto quando já é um payload tipado", () => {
    const payload = { recursos: [] as string[] };
    expect(parsePackagePayload(payload)).toBe(payload);
  });
});
