import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { APP_VERSION_LABEL } from "@/lib/app-version";
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

  it("usa o layout padrão com o fluxo em uma página e os valores na seguinte", () => {
    const html = render(
      baseDocument({
        modules: [{ title: "Controle de acesso" }],
        infrastructure: [{ title: "Totens de autoatendimento" }],
      }),
    );

    expect(html.match(/class="doc-page"/g)).toHaveLength(2);
    expect(html).toContain('data-doc-page="0"');
    expect(html).toContain("Página 1 de 2");
    expect(html).toContain("Página 2 de 2");
  });

  it("mostra a versão da aplicação no rodapé", () => {
    const html = render(baseDocument());

    expect(html).toContain(APP_VERSION_LABEL);
    expect(html).toContain("doc-footer-version");
  });

  it("mantém os itens de operação em sequência na mesma página", () => {
    const html = render(
      baseDocument({
        modules: [{ title: "Controle de acesso" }],
        infrastructure: [{ title: "Totens de autoatendimento" }],
        requirements: "Requisitos do evento",
        schedule: [{ date: "01/11/2026", title: "Marco 1", description: null }],
        disclaimer: "Avisos contratuais",
      }),
    );

    expect(html).toContain('data-doc-block="requirements"');
    expect(html).toContain('data-doc-block="schedule"');
    expect(html).toContain('data-doc-block="disclaimer"');
    expect(html.indexOf("Requisitos pré-evento")).toBeLessThan(
      html.indexOf("Cronograma Operacional"),
    );
    expect(html.indexOf("Cronograma Operacional")).toBeLessThan(
      html.indexOf("Compromissos e avisos contratuais"),
    );
  });

  it("inicia a página de valores com as condições comerciais", () => {
    const html = render(baseDocument({ valueItems: [] }));

    const valuesIndex = html.indexOf('data-doc-block="values"');
    expect(valuesIndex).toBeGreaterThan(-1);
    expect(html.indexOf("Condições comerciais")).toBeGreaterThan(valuesIndex);
    expect(html.indexOf("Composição do valor")).toBe(-1);
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
        layout={{
          pages: [
            [{ kind: "intro" }, { kind: "resources", count: 2 }],
            [{ kind: "resources", count: 2 }, { kind: "infrastructure" }],
            [{ kind: "values" }],
          ],
        }}
      />,
    );

    expect(html.match(/class="doc-page"/g)).toHaveLength(3);
    expect(html).toContain('data-doc-page="0"');
    expect(html).toContain('data-doc-page="1"');
    expect(html).toContain('data-doc-page="2"');
    expect(html).toContain("Página 1 de 3");
    expect(html).toContain("Página 3 de 3");

    const infrastructureIndex = html.indexOf(INFRASTRUCTURE_TITLE);
    const lastResourceIndex = html.indexOf("Painel de auditoria");
    expect(lastResourceIndex).toBeLessThan(infrastructureIndex);
    expect(html.indexOf("Controle de acesso")).toBeLessThan(html.indexOf("Relatórios"));
  });
});
