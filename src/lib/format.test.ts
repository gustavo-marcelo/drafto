import { describe, expect, it } from "vitest";

import {
  formatAddress,
  formatCep,
  formatCnpj,
  formatCurrency,
  formatDate,
  formatDocument,
  formatPhone,
  toDateInputValue,
} from "@/lib/format";

describe("formatCurrency", () => {
  it("formata número em BRL", () => {
    expect(formatCurrency(1234.5)).toBe("R$\u00a01.234,50");
  });

  it("aceita string numérica", () => {
    expect(formatCurrency("25000")).toBe("R$\u00a025.000,00");
  });

  it("retorna travessão para vazio, nulo ou inválido", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
    expect(formatCurrency("")).toBe("—");
    expect(formatCurrency("abc")).toBe("—");
  });
});

describe("formatDate", () => {
  it("formata Date no padrão pt-BR em UTC", () => {
    expect(formatDate(new Date("2026-11-20T13:00:00Z"))).toBe("20/11/2026");
  });

  it("aceita string ISO", () => {
    expect(formatDate("2026-12-01T00:00:00Z")).toBe("01/12/2026");
  });

  it("não desloca o dia em fusos negativos (UTC fixo)", () => {
    expect(formatDate(new Date("2026-01-01T02:00:00Z"))).toBe("01/01/2026");
  });

  it("retorna travessão para vazio ou inválido", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("data-invalida")).toBe("—");
  });
});

describe("toDateInputValue", () => {
  it("converte Date para valor de input date", () => {
    expect(toDateInputValue(new Date("2026-11-20T13:00:00Z"))).toBe("2026-11-20");
  });

  it("retorna string vazia para nulo", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue(undefined)).toBe("");
  });
});

describe("formatDocument", () => {
  it("formata CPF", () => {
    expect(formatDocument("12345678909")).toBe("123.456.789-09");
  });

  it("formata CNPJ", () => {
    expect(formatDocument("00000000000100")).toBe("00.000.000/0001-00");
  });

  it("formata parcialmente enquanto digita", () => {
    expect(formatDocument("123")).toBe("123");
    expect(formatDocument("1234")).toBe("123.4");
  });

  it("ignora não-dígitos e limita a 14 caracteres", () => {
    expect(formatDocument("12.345.678/0001-9999")).toBe("12.345.678/0001-99");
  });
});

describe("formatCnpj", () => {
  it("formata CNPJ com 14 dígitos", () => {
    expect(formatCnpj("00000000000100")).toBe("00.000.000/0001-00");
  });

  it("formata parcialmente enquanto digita", () => {
    expect(formatCnpj("00")).toBe("00");
    expect(formatCnpj("00000")).toBe("00.000");
    expect(formatCnpj("00000000")).toBe("00.000.000");
    expect(formatCnpj("000000000001")).toBe("00.000.000/0001");
  });

  it("ignora não-dígitos e limita a 14 dígitos", () => {
    expect(formatCnpj("00.000.000/0001-9999")).toBe("00.000.000/0001-99");
  });

  it("não aplica máscara de CPF", () => {
    expect(formatCnpj("12345678909")).toBe("12.345.678/909");
  });
});

describe("formatPhone", () => {
  it("formata fixo com 10 dígitos", () => {
    expect(formatPhone("6133334444")).toBe("(61) 3333-4444");
  });

  it("formata celular com 11 dígitos", () => {
    expect(formatPhone("61987654321")).toBe("(61) 98765-4321");
  });

  it("formata parcialmente enquanto digita", () => {
    expect(formatPhone("61")).toBe("(61");
    expect(formatPhone("6198")).toBe("(61) 98");
  });

  it("limita a 11 dígitos", () => {
    expect(formatPhone("619876543219999")).toBe("(61) 98765-4321");
  });
});

describe("formatCep", () => {
  it("formata 8 dígitos", () => {
    expect(formatCep("70000000")).toBe("70000-000");
  });

  it("formata parcialmente enquanto digita", () => {
    expect(formatCep("70000")).toBe("70000");
    expect(formatCep("700001")).toBe("70000-1");
  });

  it("ignora não-dígitos e limita a 8 caracteres", () => {
    expect(formatCep("70.000-000999")).toBe("70000-000");
  });
});

describe("formatAddress", () => {
  it("compõe o endereço completo", () => {
    expect(
      formatAddress({
        street: "SHS Quadra 6",
        number: "S/N",
        complement: "Bloco C",
        city: "Brasília",
        state: "DF",
        zipCode: "70000-000",
      }),
    ).toBe("SHS Quadra 6, S/N - Bloco C · Brasília/DF · 70000-000");
  });

  it("ignora partes ausentes", () => {
    expect(formatAddress({ city: "Brasília", state: "DF" })).toBe("Brasília/DF");
    expect(formatAddress({ street: "Rua A" })).toBe("Rua A");
  });

  it("retorna string vazia sem dados", () => {
    expect(formatAddress({})).toBe("");
  });
});
