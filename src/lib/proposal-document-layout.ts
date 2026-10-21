/**
 * Layout do documento: distribui os blocos do documento (apresentação,
 * catálogo, operação e valores) pelas páginas A4.
 *
 * O documento é lido como um fluxo contínuo de blocos. A medição acontece no
 * navegador (preview do wizard, HTML público e geração do PDF via Puppeteer)
 * porque depende do tamanho real do texto renderizado. `computeDocumentLayout`
 * é autossuficiente (sem imports e sem funções externas): ela é serializada
 * para dentro do browser pelo Puppeteer.
 */

export type ProposalDocumentBlockKind =
  "intro" | "resources" | "infrastructure" | "requirements" | "schedule" | "disclaimer" | "values";

export type ProposalDocumentBlock = {
  kind: ProposalDocumentBlockKind;
  /** Quantidade de itens quando o bloco é divisível (recursos ou marcos do cronograma). */
  count?: number;
};

export type ProposalDocumentLayout = {
  pages: ProposalDocumentBlock[][];
};

export function createDefaultDocumentLayout(options: {
  resourceCount: number;
  scheduleCount: number;
}): ProposalDocumentLayout {
  return {
    pages: [
      [
        { kind: "intro" },
        { kind: "resources", count: options.resourceCount },
        { kind: "infrastructure" },
        { kind: "requirements" },
        { kind: "schedule", count: options.scheduleCount },
        { kind: "disclaimer" },
      ],
      [{ kind: "values" }],
    ],
  };
}

function isSameBlock(a: ProposalDocumentBlock, b: ProposalDocumentBlock): boolean {
  return a.kind === b.kind && (a.count ?? 0) === (b.count ?? 0);
}

export function isSameDocumentLayout(
  a: ProposalDocumentLayout,
  b: ProposalDocumentLayout,
): boolean {
  if (a.pages.length !== b.pages.length) {
    return false;
  }
  return a.pages.every((page, index) => {
    const other = b.pages[index];
    return (
      page.length === other.length &&
      page.every((block, position) => isSameBlock(block, other[position]))
    );
  });
}

/** Total de páginas do documento. */
export function countDocumentPages(layout: ProposalDocumentLayout): number {
  return layout.pages.length;
}

type MeasuredBlock = {
  kind: ProposalDocumentBlockKind;
  /** Altura total do bloco como renderizado. */
  height: number;
  /** Altura fixa do bloco (título, margens internas) sem os itens. */
  overhead: number;
  /** Altura de cada item (recurso ou marco) na ordem de leitura. */
  itemHeights: number[];
  /** Colunas usadas pelos itens do bloco. */
  columns: number;
};

/**
 * Executa no navegador: mede o documento já renderizado e devolve o layout em
 * que nenhum bloco é cortado pelo rodapé da página.
 *
 * O conteúdo flui: os itens de operação continuam na sequência, sem quebra de
 * página forçada, e apenas o bloco de valores começa uma página nova.
 */
export function computeDocumentLayout(
  current: ProposalDocumentLayout,
  root?: ParentNode,
): ProposalDocumentLayout {
  type Block = MeasuredBlock;

  // Constantes locais: a função é serializada para o browser e não pode
  // depender de nenhum binding do módulo.
  const divisibleKinds: ProposalDocumentBlockKind[] = ["resources", "schedule"];
  const resourceColumns = 2;
  const tolerance = 1;

  const divisible = (kind: ProposalDocumentBlockKind): boolean => divisibleKinds.includes(kind);
  const columnsOf = (kind: ProposalDocumentBlockKind): number =>
    kind === "resources" ? resourceColumns : 1;

  const rowHeight = (itemHeights: number[], index: number, columns: number): number => {
    let height = 0;
    for (let column = 0; column < columns; column++) {
      const item = itemHeights[index + column];
      if (item === undefined) {
        break;
      }
      height = Math.max(height, item);
    }
    return height;
  };

  const rowsHeight = (itemHeights: number[], columns: number, count: number): number => {
    let total = 0;
    for (let index = 0; index < count; index += columns) {
      total += rowHeight(itemHeights, index, columns);
    }
    return total;
  };

  const rowsThatFit = (
    itemHeights: number[],
    columns: number,
    count: number,
    available: number,
  ): number => {
    let used = 0;
    let rows = 0;
    for (let index = 0; index < count; index += columns) {
      const row = rowHeight(itemHeights, index, columns);
      if (used + row > available) {
        break;
      }
      used += row;
      rows += 1;
    }
    return rows;
  };

  const toLayoutBlock = (block: Block, count: number): ProposalDocumentBlock =>
    divisible(block.kind) ? { kind: block.kind, count } : { kind: block.kind };

  const scope = root ?? (typeof document !== "undefined" ? document : null);
  if (!scope) {
    return current;
  }

  const pages = Array.from(scope.querySelectorAll(".doc-page"));
  if (pages.length === 0) {
    return current;
  }

  // ── Medição ───────────────────────────────────────────────────────────────
  const measured: Block[] = [];
  let capacity = 0;
  let gap = 0;

  for (const page of pages) {
    const footer = page.querySelector(".doc-footer");
    const pageRect = page.getBoundingClientRect();
    const footerTop = footer ? footer.getBoundingClientRect().top : pageRect.bottom;
    const elements = Array.from(page.querySelectorAll("[data-doc-block]"));
    const visible = elements.filter((element) => element.getBoundingClientRect().height > 0);

    if (visible.length === 0) {
      continue;
    }

    const firstRect = visible[0].getBoundingClientRect();
    capacity = Math.max(capacity, footerTop - firstRect.top);

    if (visible.length > 1) {
      const secondRect = visible[1].getBoundingClientRect();
      gap = Math.max(gap, secondRect.top - firstRect.bottom);
    }

    for (const element of elements) {
      const kind = element.getAttribute("data-doc-block") as ProposalDocumentBlockKind;
      const rect = element.getBoundingClientRect();
      const itemHeights = Array.from(element.querySelectorAll("[data-doc-item]")).map(
        (item) => item.getBoundingClientRect().height,
      );
      const columns = columnsOf(kind);
      const content = rowsHeight(itemHeights, columns, itemHeights.length);

      measured.push({
        kind,
        height: rect.height,
        overhead: Math.max(0, rect.height - content),
        itemHeights,
        columns,
      });
    }
  }

  if (measured.length === 0 || capacity <= 0) {
    return current;
  }

  // ── Alinhamento: blocos vazios não são renderizados, mas continuam no layout ─
  // O DOM renderiza apenas os blocos com conteúdo; os demais são alinhados
  // pela posição para que nenhum bloco (ex.: infraestrutura vazia) seja
  // perdido entre uma medição e a outra.
  const aligned: Block[] = [];
  const layoutBlocks = current.pages.flat();
  let measuredIndex = 0;

  for (const layoutBlock of layoutBlocks) {
    const next = measured[measuredIndex];

    if (next && next.kind === layoutBlock.kind) {
      aligned.push(next);
      measuredIndex += 1;
      continue;
    }

    aligned.push({
      kind: layoutBlock.kind,
      height: 0,
      overhead: 0,
      itemHeights: [],
      columns: columnsOf(layoutBlock.kind),
    });
  }

  while (measuredIndex < measured.length) {
    aligned.push(measured[measuredIndex]);
    measuredIndex += 1;
  }

  // ── Agrupamento: blocos divisíveis consecutivos viram um só bloco ────────
  const grouped: Block[] = [];
  for (const block of aligned) {
    const previous = grouped[grouped.length - 1];

    if (previous && divisible(block.kind) && previous.kind === block.kind) {
      previous.itemHeights = previous.itemHeights.concat(block.itemHeights);
      if (block.itemHeights.length > 0) {
        previous.overhead = block.overhead;
      }
      // Blocos do mesmo tipo na mesma página são renderizados como uma
      // seção única, com um único título.
      previous.height =
        previous.overhead +
        rowsHeight(previous.itemHeights, previous.columns, previous.itemHeights.length);
      continue;
    }

    grouped.push({ ...block, itemHeights: block.itemHeights.slice() });
  }

  // ── Empacotamento: distribution dos blocos pelas páginas ─────────────────
  const packed: ProposalDocumentBlock[][] = [];
  let currentPage: ProposalDocumentBlock[] = [];
  let used = 0;

  /** Quantos itens do bloco cabem no espaço disponível (já descontando o overhead). */
  const fitsRows = (block: Block, available: number): number =>
    rowsThatFit(block.itemHeights, block.columns, block.itemHeights.length, available);

  const chunkOf = (block: Block, items: number[]): Block => ({
    ...block,
    itemHeights: items,
    height: block.overhead + rowsHeight(items, block.columns, items.length),
  });

  for (const block of grouped) {
    // A página de valores sempre começa uma nova página, com "Condições comerciais" no topo.
    if (block.kind === "values") {
      if (currentPage.length > 0) {
        packed.push(currentPage);
        currentPage = [];
        used = 0;
      }
      packed.push([{ kind: "values" }]);
      continue;
    }

    const spacing = currentPage.length > 0 ? gap : 0;

    if (used + spacing + block.height <= capacity + tolerance) {
      currentPage.push(toLayoutBlock(block, block.itemHeights.length));
      used += spacing + block.height;
      continue;
    }

    // Bloco divisível: encaixa o máximo de itens na página atual e leva o
    // restante para as páginas seguintes, também dividido para caber.
    if (divisible(block.kind) && block.itemHeights.length > 0) {
      const rows = fitsRows(block, capacity - used - spacing - block.overhead);

      if (rows > 0) {
        const count = Math.min(block.itemHeights.length, rows * block.columns);
        const piece = chunkOf(block, block.itemHeights.slice(0, count));
        currentPage.push(toLayoutBlock(piece, count));
        used += spacing + piece.height;

        let rest = block.itemHeights.slice(count);
        while (rest.length > 0) {
          packed.push(currentPage);
          currentPage = [];
          used = 0;

          const rowsPerPage = rowsThatFit(
            rest,
            block.columns,
            rest.length,
            capacity - block.overhead,
          );
          const take = Math.max(1, Math.min(rest.length, rowsPerPage * block.columns));
          const chunk = chunkOf(block, rest.slice(0, take));
          currentPage = [toLayoutBlock(chunk, take)];
          used = chunk.height;
          rest = rest.slice(take);
        }

        continue;
      }
    }

    if (currentPage.length > 0) {
      packed.push(currentPage);
      currentPage = [];
      used = 0;
    }

    currentPage.push(toLayoutBlock(block, block.itemHeights.length));
    used = block.height;
  }

  if (currentPage.length > 0) {
    packed.push(currentPage);
  }

  const next: ProposalDocumentLayout = { pages: packed };
  const same =
    next.pages.length === current.pages.length &&
    next.pages.every((page, index) => {
      const other = current.pages[index];
      return (
        page.length === other.length &&
        page.every((block, position) => {
          const compare = other[position];
          return block.kind === compare.kind && (block.count ?? 0) === (compare.count ?? 0);
        })
      );
    });

  return same ? current : next;
}
