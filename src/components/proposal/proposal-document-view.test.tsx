import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PROPOSAL_DOCUMENT_CSS } from "@/lib/proposal-document-css";
import type { ProposalDocument } from "@/lib/proposal-document";

import { ProposalDocumentView } from "./proposal-document-view";

const RESOURCES_TITLE = "Recursos do sistema de credenciamento";
const INFRASTRUCTURE_TITLE = "Infraestrutura e operação";

function baseDocument(overrides: Partial<ProposalDocument> = {}): ProposalDocument {
  return {
    code: "PR0001.0001",
    title: "Lançamento Brasília",
    client: null,
    modules: [],
    infrastructure: [],
    valueItems: [],
    payments: [],
    schedule: [],
    settings: {},
    ...overrides,
  };
}

function render(document: ProposalDocument): string {
  return renderToStaticMarkup(<ProposalDocumentView document={document} />);
}

describe("ProposalDocumentView", () => {
  it("mantém recursos e infraestrutura empilhados, com os itens em duas colunas", () => {
    const html = render(
      baseDocument({
        modules: [{ title: "Controle de acesso" }],
        infrastructure: [{ title: "Totens de autoatendimento" }],
      }),
    );

    expect(html).toContain(RESOURCES_TITLE);
    expect(html).toContain(INFRASTRUCTURE_TITLE);
    expect(html.indexOf(RESOURCES_TITLE)).toBeLessThan(html.indexOf(INFRASTRUCTURE_TITLE));
    expect(html.match(/class="doc-list"/g)).toHaveLength(2);
    expect(PROPOSAL_DOCUMENT_CSS).toMatch(/\.doc-list\s*\{[^}]*column-count:\s*2/);
  });

  it("não exibe a seção de infraestrutura quando está vazia", () => {
    const html = render(
      baseDocument({
        modules: [{ title: "Controle de acesso" }],
        infrastructure: [],
      }),
    );

    expect(html).not.toContain(INFRASTRUCTURE_TITLE);
    expect(html).toContain(RESOURCES_TITLE);
    expect(html.match(/class="doc-list"/g)).toHaveLength(1);
  });

  it("não exibe a seção de recursos quando está vazia", () => {
    const html = render(
      baseDocument({
        modules: [],
        infrastructure: [{ title: "Totens de autoatendimento" }],
      }),
    );

    expect(html).not.toContain(RESOURCES_TITLE);
    expect(html).toContain(INFRASTRUCTURE_TITLE);
    expect(html.match(/class="doc-list"/g)).toHaveLength(1);
  });

  it("não exibe nenhuma das seções quando ambas estão vazias", () => {
    const html = render(baseDocument());

    expect(html).not.toContain(RESOURCES_TITLE);
    expect(html).not.toContain(INFRASTRUCTURE_TITLE);
    expect(html).not.toContain("doc-list");
  });

  it("mostra a composição do valor com quantidade, valor unitário e subtotal", () => {
    const html = render(
      baseDocument({
        valueItems: [
          {
            description: "Licença, configuração e painel do sistema de credenciamento",
            quantity: 1,
            unitValue: 12000,
            subtotal: 12000,
          },
        ],
      }),
    );

    expect(html).toContain("Composição do valor");
    expect(html).toContain("Licença, configuração e painel do sistema de credenciamento");
    expect(html).toContain("Valor unitário");
    expect(html).toContain("Subtotal");
  });

  it("não exibe a composição do valor quando não há itens", () => {
    const html = render(baseDocument());

    expect(html).not.toContain("Composição do valor");
  });
});
