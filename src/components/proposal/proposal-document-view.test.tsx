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

  it("mostra a composição do valor depois das condições comerciais", () => {
    const html = render(
      baseDocument({
        valueItems: [
          { description: "Licença do sistema", quantity: 1, unitValue: 12000, subtotal: 12000 },
        ],
      }),
    );

    expect(html.indexOf("Condições comerciais")).toBeLessThan(html.indexOf("Composição do valor"));
  });

  it("não repete o valor total nas condições comerciais e rotula o total da composição", () => {
    const html = render(
      baseDocument({
        valueItems: [
          { description: "Licença do sistema", quantity: 1, unitValue: 12000, subtotal: 12000 },
        ],
      }),
    );

    expect(html).not.toContain("Valor total");
    expect(html).toContain("Investimento");
  });

  it("mantém três páginas quando o catálogo cabe em uma", () => {
    const html = render(
      baseDocument({
        modules: [{ title: "Controle de acesso" }],
        infrastructure: [{ title: "Totens de autoatendimento" }],
      }),
    );

    expect(html.match(/class="doc-page"/g)).toHaveLength(3);
    expect(html).toContain('data-doc-catalog-page="0"');
    expect(html).toContain("Página 1 de 3");
    expect(html).toContain("Página 3 de 3");
  });

  it("divide o catálogo em páginas conforme o layout informado", () => {
    const document = baseDocument({
      modules: [
        { title: "Controle de acesso" },
        { title: "Emissão de credenciais" },
        { title: "Relatórios" },
        { title: "Painel de auditoria" },
      ],
      infrastructure: [{ title: "Totens de autoatendimento" }],
    });

    const html = renderToStaticMarkup(
      <ProposalDocumentView
        document={document}
        layout={{ resourceCounts: [2, 2], infrastructurePage: 1 }}
      />,
    );

    expect(html.match(/class="doc-page"/g)).toHaveLength(4);
    expect(html).toContain('data-doc-catalog-page="0"');
    expect(html).toContain('data-doc-catalog-page="1"');
    expect(html).toContain("Página 1 de 4");
    expect(html).toContain("Página 4 de 4");

    const infrastructureIndex = html.indexOf(INFRASTRUCTURE_TITLE);
    const lastResourceIndex = html.indexOf("Painel de auditoria");
    expect(lastResourceIndex).toBeLessThan(infrastructureIndex);
    expect(html.indexOf("Controle de acesso")).toBeLessThan(html.indexOf("Relatórios"));
  });
});
