"use client";

import { useEffect, useRef, useState } from "react";

import type { ProposalDocument } from "@/lib/proposal-document";
import {
  computeDocumentLayout,
  countDocumentPages,
  createDefaultDocumentLayout,
  isSameDocumentLayout,
  type ProposalDocumentLayout,
} from "@/lib/proposal-document-layout";

import { ProposalDocumentView } from "./proposal-document-view";

type ProposalDocumentAutoLayoutProps = {
  document: ProposalDocument;
  includeFooter?: boolean;
  onPageCountChange?: (pageCount: number) => void;
};

const MAX_ITERATIONS = 6;

/**
 * Renderiza o documento e ajusta a paginação quando o conteúdo ultrapassa o
 * espaço disponível: a seção "Infraestrutura e operação" e os recursos extras
 * passam para a página seguinte em vez de serem cortados.
 */
export function ProposalDocumentAutoLayout({
  document,
  includeFooter = true,
  onPageCountChange,
}: ProposalDocumentAutoLayoutProps) {
  const resourceCount = document.modules.length;
  const [layout, setLayout] = useState<ProposalDocumentLayout>(() =>
    createDefaultDocumentLayout(resourceCount),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const iterationsRef = useRef(0);
  const callbackRef = useRef(onPageCountChange);

  useEffect(() => {
    callbackRef.current = onPageCountChange;
  }, [onPageCountChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const distributed = layout.resourceCounts.reduce((total, count) => total + count, 0);
    const next =
      distributed === resourceCount
        ? computeDocumentLayout(resourceCount, layout, container)
        : createDefaultDocumentLayout(resourceCount);

    if (!isSameDocumentLayout(next, layout)) {
      iterationsRef.current += 1;
      if (iterationsRef.current <= MAX_ITERATIONS) {
        setLayout(next);
        return;
      }
    }

    iterationsRef.current = 0;
    callbackRef.current?.(countDocumentPages(layout));
  }, [document, layout, resourceCount]);

  return (
    <div ref={containerRef}>
      <ProposalDocumentView document={document} includeFooter={includeFooter} layout={layout} />
    </div>
  );
}
