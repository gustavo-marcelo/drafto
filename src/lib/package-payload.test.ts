import { describe, expect, it } from "vitest";

import { parsePackagePayload } from "@/lib/package-payload";

describe("parsePackagePayload", () => {
  it("retorna objeto vazio para payload nulo ou não-objeto", () => {
    expect(parsePackagePayload(null)).toEqual({});
    expect(parsePackagePayload(undefined)).toEqual({});
    expect(parsePackagePayload("texto")).toEqual({});
    expect(parsePackagePayload(42)).toEqual({});
  });

  it("preserva recursos e equipamentos válidos", () => {
    const payload = {
      recursos: ["controle-de-acesso", "chapelaria"],
      equipamentos: [{ name: "Totem", quantity: 5, specs: '15,6"' }],
    };
    expect(parsePackagePayload(payload)).toEqual(payload);
  });

  it("aceita objeto parcial", () => {
    expect(parsePackagePayload({ recursos: ["a"] })).toEqual({ recursos: ["a"] });
    expect(parsePackagePayload({ equipamentos: [] })).toEqual({ equipamentos: [] });
  });

  it("retorna o mesmo objeto quando já é um payload tipado", () => {
    const payload = { recursos: [] as string[] };
    expect(parsePackagePayload(payload)).toBe(payload);
  });
});
