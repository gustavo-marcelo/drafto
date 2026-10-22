import { describe, expect, it } from "vitest";

import { DOC_SELECTORS } from "./proposal-document-dom";
import {
  computeDocumentLayout,
  countDocumentPages,
  createDefaultDocumentLayout,
  isSameDocumentLayout,
  type ProposalDocumentLayout,
} from "./proposal-document-layout";

type FakeBlock = {
  kind: string;
  top: number;
  height: number;
  itemHeights: number[];
};

function createBlock(
  kind: string,
  top: number,
  height: number,
  itemHeights: number[] = [],
): FakeBlock {
  return { kind, top, height, itemHeights };
}

function createPage(blocks: FakeBlock[], footerTop: number): Element {
  const elements = blocks.map((block) => ({
    getAttribute: (name: string) => (name === DOC_SELECTORS.blockAttribute ? block.kind : null),
    getBoundingClientRect: () =>
      ({ top: block.top, bottom: block.top + block.height, height: block.height }) as DOMRect,
    querySelectorAll: (selector: string) =>
      selector === DOC_SELECTORS.item
        ? block.itemHeights.map((height) => ({
            getBoundingClientRect: () => ({ height }) as DOMRect,
          }))
        : [],
  }));

  return {
    querySelector: (selector: string) =>
      selector === DOC_SELECTORS.footer
        ? { getBoundingClientRect: () => ({ top: footerTop }) as DOMRect }
        : null,
    querySelectorAll: (selector: string) => (selector === DOC_SELECTORS.block ? elements : []),
    getBoundingClientRect: () => ({ top: 0, bottom: footerTop }) as DOMRect,
  } as unknown as Element;
}

function createScope(pages: Element[]): ParentNode {
  return {
    querySelectorAll: (selector: string) => (selector === DOC_SELECTORS.page ? pages : []),
  } as unknown as ParentNode;
}

describe("proposal-document-layout", () => {
  it("cria o layout padrão com o fluxo de blocos", () => {
    const layout = createDefaultDocumentLayout({ resourceCount: 8, scheduleCount: 3 });

    expect(layout.pages[0]).toEqual([
      { kind: "intro" },
      { kind: "resources", count: 8 },
      { kind: "infrastructure" },
      { kind: "requirements" },
      { kind: "schedule", count: 3 },
      { kind: "disclaimer" },
    ]);
    expect(layout.pages[1]).toEqual([{ kind: "values" }]);
    expect(countDocumentPages(layout)).toBe(2);
  });

  it("compara layouts pelo conteúdo", () => {
    const a = createDefaultDocumentLayout({ resourceCount: 4, scheduleCount: 0 });
    const b = createDefaultDocumentLayout({ resourceCount: 4, scheduleCount: 0 });

    expect(isSameDocumentLayout(a, b)).toBe(true);
    expect(isSameDocumentLayout(a, { pages: [[{ kind: "values" }]] })).toBe(false);
    expect(
      isSameDocumentLayout(a, {
        pages: [[{ kind: "intro" }, { kind: "resources", count: 2 }], [{ kind: "values" }]],
      }),
    ).toBe(false);
  });

  it("mantém os blocos de operação na mesma página quando há espaço", () => {
    const layout = createDefaultDocumentLayout({ resourceCount: 2, scheduleCount: 2 });
    const scope = createScope([
      createPage(
        [
          createBlock("intro", 100, 200),
          createBlock("resources", 320, 100, [50, 50]),
          createBlock("infrastructure", 440, 80),
          createBlock("requirements", 540, 60),
          createBlock("schedule", 620, 80, [40, 40]),
          createBlock("disclaimer", 720, 60),
        ],
        800,
      ),
      createPage([createBlock("values", 100, 600)], 800),
    ]);

    const next = computeDocumentLayout({ current: layout, root: scope, selectors: DOC_SELECTORS });

    expect(next.pages).toHaveLength(2);
    expect(next.pages[0]).toEqual([
      { kind: "intro" },
      { kind: "resources", count: 2 },
      { kind: "infrastructure" },
      { kind: "requirements" },
      { kind: "schedule", count: 2 },
      { kind: "disclaimer" },
    ]);
    expect(next.pages[1]).toEqual([{ kind: "values" }]);
  });

  it("divide os recursos quando não cabem na página", () => {
    const layout = createDefaultDocumentLayout({ resourceCount: 8, scheduleCount: 0 });
    const scope = createScope([
      createPage(
        [
          createBlock("intro", 100, 200),
          createBlock("resources", 320, 600, [150, 150, 150, 150, 150, 150, 150, 150]),
        ],
        800,
      ),
      createPage([createBlock("values", 100, 600)], 800),
    ]);

    const next = computeDocumentLayout({ current: layout, root: scope, selectors: DOC_SELECTORS });

    const resourceBlocks = next.pages.flat().filter((block) => block.kind === "resources");
    expect(resourceBlocks.length).toBeGreaterThan(1);
    expect(resourceBlocks.reduce((total, block) => total + (block.count ?? 0), 0)).toBe(8);
    expect(next.pages[next.pages.length - 1]).toEqual([{ kind: "values" }]);
  });

  it("mantém a página de valores sempre no início de uma página", () => {
    const layout = createDefaultDocumentLayout({ resourceCount: 1, scheduleCount: 0 });
    const scope = createScope([
      createPage(
        [
          createBlock("intro", 100, 200),
          createBlock("resources", 320, 100, [50]),
          createBlock("infrastructure", 440, 80),
          createBlock("values", 540, 300),
        ],
        800,
      ),
    ]);

    const next = computeDocumentLayout({ current: layout, root: scope, selectors: DOC_SELECTORS });

    expect(next.pages[next.pages.length - 1]).toEqual([{ kind: "values" }]);
    expect(next.pages.flat().filter((block) => block.kind === "values")).toHaveLength(1);
  });

  it("mantém o layout quando não há blocos medidos", () => {
    const layout: ProposalDocumentLayout = { pages: [[{ kind: "values" }]] };
    const scope = createScope([]);

    expect(computeDocumentLayout({ current: layout, root: scope, selectors: DOC_SELECTORS })).toBe(
      layout,
    );
  });

  it("preserva blocos sem conteúdo no layout", () => {
    const layout = createDefaultDocumentLayout({ resourceCount: 2, scheduleCount: 2 });
    const scope = createScope([
      createPage(
        [
          createBlock("intro", 100, 200),
          createBlock("resources", 320, 100, [50, 50]),
          // A infraestrutura vazia não é renderizada, mas continua no layout.
          createBlock("schedule", 440, 80, [40, 40]),
        ],
        800,
      ),
      createPage([createBlock("values", 100, 600)], 800),
    ]);

    const next = computeDocumentLayout({ current: layout, root: scope, selectors: DOC_SELECTORS });

    expect(next.pages[0]).toEqual([
      { kind: "intro" },
      { kind: "resources", count: 2 },
      { kind: "infrastructure" },
      { kind: "requirements" },
      { kind: "schedule", count: 2 },
      { kind: "disclaimer" },
    ]);
  });

  it("desconta o título do bloco ao dividir os recursos", () => {
    const layout = createDefaultDocumentLayout({ resourceCount: 8, scheduleCount: 0 });
    const scope = createScope([
      createPage(
        [
          createBlock("intro", 100, 200),
          // 8 itens de 100px em duas colunas (4 linhas = 400px) e 100px de título.
          createBlock("resources", 320, 500, [100, 100, 100, 100, 100, 100, 100, 100]),
        ],
        800,
      ),
      createPage([createBlock("values", 100, 600)], 800),
    ]);

    const next = computeDocumentLayout({ current: layout, root: scope, selectors: DOC_SELECTORS });

    expect(next.pages[0]).toEqual([{ kind: "intro" }, { kind: "resources", count: 6 }]);
    expect(next.pages[1]).toEqual([
      { kind: "resources", count: 2 },
      { kind: "infrastructure" },
      { kind: "requirements" },
      { kind: "schedule", count: 0 },
      { kind: "disclaimer" },
    ]);
    expect(next.pages[next.pages.length - 1]).toEqual([{ kind: "values" }]);
  });
});
