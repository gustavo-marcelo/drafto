import { Fragment, type ReactNode } from "react";

import type { ProposalDocument } from "@/lib/proposal-document";
import {
  countDocumentPages,
  createDefaultDocumentLayout,
  type ProposalDocumentBlock,
  type ProposalDocumentBlockKind,
  type ProposalDocumentLayout,
} from "@/lib/proposal-document-layout";

import {
  CatalogSection,
  DisclaimerBlock,
  DocumentFooter,
  DocumentHeader,
  IntroBlock,
  RequirementsBlock,
  ScheduleList,
  ValuesBlock,
} from "./proposal-document-parts";

type BlockContext = {
  document: ProposalDocument;
  block: ProposalDocumentBlock;
  /** Quantidade de itens já consumidos do bloco (recursos, infraestrutura, cronograma). */
  offset: number;
  titleHeadingLevel: "h1" | "h2";
};

type BlockRenderer = (context: BlockContext) => ReactNode;

/**
 * Blocos com itens: o solver pode quebrar o conteúdo em várias páginas e o
 * offset garante que cada parte renderize apenas os itens que lhe pertencem.
 */
const ITEM_SOURCES = {
  resources: (document: ProposalDocument) => document.modules,
  infrastructure: (document: ProposalDocument) => document.infrastructure,
  schedule: (document: ProposalDocument) => document.schedule,
} as const;

type ItemKind = keyof typeof ITEM_SOURCES;

function isItemKind(kind: ProposalDocumentBlockKind): kind is ItemKind {
  return kind === "resources" || kind === "infrastructure" || kind === "schedule";
}

const BLOCK_RENDERERS: Record<ProposalDocumentBlockKind, BlockRenderer> = {
  intro: ({ document, titleHeadingLevel }) => (
    <IntroBlock document={document} titleHeadingLevel={titleHeadingLevel} />
  ),
  resources: ({ document, block, offset }) => (
    <CatalogSection
      title="Recursos do sistema de credenciamento"
      items={sliceItems(document.modules, block, offset)}
      block="resources"
    />
  ),
  infrastructure: ({ document, block, offset }) => (
    <CatalogSection
      title="Infraestrutura e operação"
      items={sliceItems(document.infrastructure, block, offset)}
      block="infrastructure"
    />
  ),
  requirements: ({ document }) => <RequirementsBlock document={document} />,
  schedule: ({ document, block, offset }) => (
    <ScheduleList items={sliceItems(document.schedule, block, offset)} />
  ),
  disclaimer: ({ document }) => <DisclaimerBlock document={document} />,
  values: ({ document }) => <ValuesBlock document={document} />,
};

/** Itens do bloco dentro da página: respeita o `count` definido pelo layout. */
function sliceItems<T>(source: T[], block: ProposalDocumentBlock, offset: number): T[] {
  const count = block.count ?? source.length - offset;
  return source.slice(offset, offset + Math.max(0, count));
}

type ResolvedBlock = { key: string; content: ReactNode };

/**
 * Resolve os blocos do layout em conteúdo, distribuindo os itens de recursos,
 * infraestrutura e cronograma na ordem de leitura do documento.
 */
function resolveLayout(
  layout: ProposalDocumentLayout,
  document: ProposalDocument,
  titleHeadingLevel: "h1" | "h2",
): ResolvedBlock[][] {
  const offsets: Partial<Record<ItemKind, number>> = {};

  return layout.pages.map((blocks) =>
    blocks.map((block) => {
      const kind = block.kind;
      const source = isItemKind(kind) ? ITEM_SOURCES[kind] : undefined;
      const offset = source ? (offsets[kind as ItemKind] ?? 0) : 0;
      const content = BLOCK_RENDERERS[block.kind]({
        document,
        block,
        offset,
        titleHeadingLevel,
      });

      if (source) {
        offsets[kind as ItemKind] = offset + (block.count ?? source(document).length - offset);
      }

      return { key: `${block.kind}-${offset}`, content };
    }),
  );
}

export function ProposalDocumentView({
  document,
  includeFooter = true,
  layout,
  titleHeadingLevel = "h1",
}: {
  document: ProposalDocument;
  includeFooter?: boolean;
  layout?: ProposalDocumentLayout;
  /**
   * Nível do título principal do documento. Use "h2" quando o documento é
   * exibido dentro de uma página que já tem um "h1" (preview do wizard).
   */
  titleHeadingLevel?: "h1" | "h2";
}) {
  const activeLayout =
    layout ??
    createDefaultDocumentLayout({
      resourceCount: document.modules.length,
      scheduleCount: document.schedule.length,
    });

  const totalPages = countDocumentPages(activeLayout);
  const pages = resolveLayout(activeLayout, document, titleHeadingLevel);

  return (
    <div>
      {pages.map((blocks, pageIndex) => (
        <article className="doc-page" key={pageIndex} data-doc-page={pageIndex}>
          <DocumentHeader document={document} />

          {blocks.map((block) => (
            <Fragment key={block.key}>{block.content}</Fragment>
          ))}

          {includeFooter && (
            <DocumentFooter
              document={document}
              pageNumber={pageIndex + 1}
              totalPages={totalPages}
            />
          )}
        </article>
      ))}
    </div>
  );
}
