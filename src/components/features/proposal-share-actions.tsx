"use client";

import { useState } from "react";

type ProposalShareActionsProps = {
  proposalId: string;
  shareId?: string | null;
};

export function ProposalShareActions({ proposalId, shareId }: ProposalShareActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!shareId) return;
    const url = `${window.location.origin}/p/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link da proposta:", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/api/propostas/${proposalId}/pdf`}
        className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-3 py-1.5 text-sm transition-colors"
      >
        Baixar PDF
      </a>

      {shareId && (
        <>
          <a
            href={`/p/${shareId}`}
            target="_blank"
            rel="noreferrer"
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            Abrir link público
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            {copied ? "Link copiado!" : "Copiar link"}
          </button>
        </>
      )}
    </div>
  );
}
