import { describe, expect, it } from "vitest";

import {
  computeDocumentLayout,
  countDocumentPages,
  createDefaultDocumentLayout,
  isSameDocumentLayout,
  type ProposalDocumentLayout,
} from "./proposal-document-layout";

function createFakePage(options: {
  catalogPage?: number;
  footerTop: number;
  sections: { catalog?: "resources" | "infrastructure"; bottom: number }[];
}) {
  const page = {
    getAttribute: (name: string) =>
      name === "data-doc-catalog-page" && options.catalogPage !== undefined
        ? String(options.catalogPage)
        : null,
    getBoundingClientRect: () => ({ top: 0, bottom: 1000 }) as DOMRect,
    querySelector: (selector: string) =>
      selector === ".doc-footer"
        ? { getBoundingClientRect: () => ({ top: options.footerTop }) }
        : null,
    querySelectorAll: (selector: string) => {
      if (selector !== ".doc-section") {
        return [];
      }
      return options.sections.map((section) => ({
        getAttribute: (name: string) =>
          name === "data-doc-catalog" ? (section.catalog ?? null) : null,
        getBoundingClientRect: () => ({ top: 0, bottom: section.bottom }) as DOMRect,
      }));
    },
  };

  return page as unknown as Element;
}

function createScope(pages: Element[]): ParentNode {
  return {
    querySelectorAll: () => pages,
  } as unknown as ParentNode;
}

describe("proposal-document-layout", () => {
  it("cria o layout padrão com todos os recursos na primeira página", () => {
    const layout = createDefaultDocumentLayout(8);

    expect(layout).toEqual({ resourceCounts: [8], infrastructurePage: 0 });
    expect(countDocumentPages(layout)).toBe(3);
  });

  it("compara layouts pelo conteúdo", () => {
    const a = createDefaultDocumentLayout(4);
    const b = createDefaultDocumentLayout(4);

    expect(isSameDocumentLayout(a, b)).toBe(true);
    expect(isSameDocumentLayout(a, { resourceCounts: [2, 2], infrastructurePage: 0 })).toBe(false);
    expect(isSameDocumentLayout(a, { resourceCounts: [4], infrastructurePage: 1 })).toBe(false);
  });

  it("mantém o layout quando não há overflow", () => {
    const layout = createDefaultDocumentLayout(3);
    const scope = createScope([
      createFakePage({ catalogPage: 0, footerTop: 800, sections: [{ bottom: 700 }] }),
    ]);

    expect(computeDocumentLayout(3, layout, scope)).toEqual(layout);
  });

  it("move a infraestrutura para a página seguinte quando ela invade o rodapé", () => {
    const layout = createDefaultDocumentLayout(3);
    const scope = createScope([
      createFakePage({
        catalogPage: 0,
        footerTop: 800,
        sections: [
          { catalog: "resources", bottom: 700 },
          { catalog: "infrastructure", bottom: 860 },
        ],
      }),
    ]);

    const next = computeDocumentLayout(3, layout, scope);

    expect(next).toEqual({ resourceCounts: [3, 0], infrastructurePage: 1 });
    expect(countDocumentPages(next)).toBe(4);
  });

  it("separa a infraestrutura quando ela não cabe na primeira página do catálogo", () => {
    const layout = createDefaultDocumentLayout(6);
    const scope = createScope([
      createFakePage({
        catalogPage: 0,
        footerTop: 800,
        sections: [
          { catalog: "resources", bottom: 700 },
          { catalog: "infrastructure", bottom: 860 },
        ],
      }),
    ]);

    const next = computeDocumentLayout(6, layout, scope);

    expect(next.resourceCounts.reduce((total, count) => total + count, 0)).toBe(6);
    expect(next.resourceCounts.length).toBeGreaterThan(1);
    expect(next.infrastructurePage).toBe(next.resourceCounts.length - 1);
    expect(countDocumentPages(next)).toBe(next.resourceCounts.length + 2);
  });

  it("divide os recursos entre as páginas quando a lista invade o rodapé", () => {
    const layout = createDefaultDocumentLayout(8);
    const scope = createScope([
      createFakePage({
        catalogPage: 0,
        footerTop: 800,
        sections: [{ catalog: "resources", bottom: 900 }],
      }),
    ]);

    const next = computeDocumentLayout(8, layout, scope);

    expect(next.resourceCounts.reduce((total, count) => total + count, 0)).toBe(8);
    expect(next.resourceCounts.length).toBe(2);
    expect(next.resourceCounts[0]).toBeLessThan(8);
    expect(next.infrastructurePage).toBe(1);
  });

  it("ignora overflow fora do catálogo", () => {
    const layout: ProposalDocumentLayout = { resourceCounts: [3], infrastructurePage: 0 };
    const scope = createScope([createFakePage({ footerTop: 800, sections: [{ bottom: 900 }] })]);

    expect(computeDocumentLayout(3, layout, scope)).toEqual(layout);
  });
});
