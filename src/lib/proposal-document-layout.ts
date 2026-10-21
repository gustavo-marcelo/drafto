/**
 * Layout do documento: define quantas páginas o catálogo (recursos +
 * infraestrutura) ocupa e em qual página fica a seção de infraestrutura.
 *
 * A medição acontece no navegador (preview do wizard, HTML público e
 * geração do PDF via Puppeteer) porque depende do tamanho real do texto
 * renderizado. `computeDocumentLayout` não pode usar imports externos: a
 * função é serializada para dentro do browser pelo Puppeteer.
 */
export type ProposalDocumentLayout = {
  /** Quantidade de itens do catálogo de recursos exibidos em cada página do catálogo. */
  resourceCounts: number[];
  /** Índice da página do catálogo que recebe a seção "Infraestrutura e operação". */
  infrastructurePage: number;
};

export function createDefaultDocumentLayout(resourceCount: number): ProposalDocumentLayout {
  return { resourceCounts: [Math.max(resourceCount, 0)], infrastructurePage: 0 };
}

export function isSameDocumentLayout(
  a: ProposalDocumentLayout,
  b: ProposalDocumentLayout,
): boolean {
  return (
    a.infrastructurePage === b.infrastructurePage &&
    a.resourceCounts.length === b.resourceCounts.length &&
    a.resourceCounts.every((count, index) => count === b.resourceCounts[index])
  );
}

/** Total de páginas do documento: páginas do catálogo + operação + valores. */
export function countDocumentPages(layout: ProposalDocumentLayout): number {
  return layout.resourceCounts.length + 2;
}

/**
 * Executa no navegador: mede o documento já renderizado e devolve o próximo
 * layout para que nenhum conteúdo seja cortado pela página.
 *
 * Regras:
 * - se a seção de infraestrutura invade o rodapé, ela vai para a página seguinte;
 * - se a lista de recursos ainda invade o rodapé, parte dela vai para a página
 *   seguinte do catálogo.
 *
 * A função é executada dentro do browser (preview, HTML público e PDF via
 * Puppeteer), por isso não depende de imports externos.
 */
export function computeDocumentLayout(
  resourceCount: number,
  current: ProposalDocumentLayout,
  root?: ParentNode,
): ProposalDocumentLayout {
  const scope = root ?? (typeof document !== "undefined" ? document : null);
  if (!scope) {
    return current;
  }

  const pages = Array.from(scope.querySelectorAll(".doc-page"));
  if (pages.length === 0) {
    return current;
  }

  const limitOf = (page: Element): number => {
    const footer = page.querySelector(".doc-footer");
    if (footer) {
      return footer.getBoundingClientRect().top;
    }
    const rect = page.getBoundingClientRect();
    const padding = parseFloat(getComputedStyle(page).paddingBottom) || 0;
    return rect.bottom - padding;
  };

  const catalogIndexOf = (page: Element): number => {
    const value = page.getAttribute("data-doc-catalog-page");
    return value === null ? -1 : Number(value);
  };

  let overflowPage: Element | null = null;
  let overflowSection: Element | null = null;

  for (const page of pages) {
    const limit = limitOf(page);
    for (const section of page.querySelectorAll(".doc-section")) {
      if (section.getBoundingClientRect().bottom > limit + 1) {
        overflowPage = page;
        overflowSection = section;
        break;
      }
    }
    if (overflowSection) {
      break;
    }
  }

  const counts = current.resourceCounts.slice();

  if (!overflowSection || !overflowPage) {
    return current;
  }

  const catalogIndex = catalogIndexOf(overflowPage);
  const isInfrastructure = overflowSection.getAttribute("data-doc-catalog") === "infrastructure";

  if (isInfrastructure) {
    if (catalogIndex >= counts.length - 1) {
      counts.push(0);
    }
    return { resourceCounts: counts, infrastructurePage: counts.length - 1 };
  }

  if (catalogIndex < 0) {
    return current;
  }

  const available = counts[catalogIndex] ?? 0;
  if (available <= 1) {
    return current;
  }

  const moved = Math.max(1, Math.floor(available / 2));
  counts[catalogIndex] = available - moved;
  const nextIndex = catalogIndex + 1;
  if (nextIndex >= counts.length) {
    counts.push(moved);
  } else {
    counts[nextIndex] = (counts[nextIndex] ?? 0) + moved;
  }

  return {
    resourceCounts: counts,
    infrastructurePage: Math.max(current.infrastructurePage, nextIndex),
  };
}
