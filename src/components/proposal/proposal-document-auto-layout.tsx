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
 * espaço disponível: os blocos passam a ocupar quantas páginas forem
 * necessárias, sem cortar seções pelo rodapé.
 */
export function ProposalDocumentAutoLayout({
  document,
  includeFooter = true,
  onPageCountChange,
}: ProposalDocumentAutoLayoutProps) {
  const countsKey = `${document.modules.length}:${document.schedule.length}`;
  const [layout, setLayout] = useState<ProposalDocumentLayout>(() =>
    createDefaultDocumentLayout({
      resourceCount: document.modules.length,
      scheduleCount: document.schedule.length,
    }),
  );
  const [renderedCountsKey, setRenderedCountsKey] = useState(countsKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const iterationsRef = useRef(0);
  const callbackRef = useRef(onPageCountChange);

  // Quando a quantidade de recursos ou de marcos muda, o layout é refeito do
  // zero para não manter contagens obsoletas (ajuste durante o render).
  if (renderedCountsKey !== countsKey) {
    setRenderedCountsKey(countsKey);
    setLayout(
      createDefaultDocumentLayout({
        resourceCount: document.modules.length,
        scheduleCount: document.schedule.length,
      }),
    );
  }

  useEffect(() => {
    callbackRef.current = onPageCountChange;
  }, [onPageCountChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const next = computeDocumentLayout(layout, container);

    if (!isSameDocumentLayout(next, layout)) {
      iterationsRef.current += 1;
      if (iterationsRef.current <= MAX_ITERATIONS) {
        setLayout(next);
        return;
      }
    }

    iterationsRef.current = 0;
    callbackRef.current?.(countDocumentPages(layout));
  }, [document, layout]);

  return (
    <div ref={containerRef}>
      <ProposalDocumentView document={document} includeFooter={includeFooter} layout={layout} />
    </div>
  );
}
