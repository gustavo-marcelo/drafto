import { notFound } from "next/navigation";

import { ProposalDocumentAutoLayout } from "@/components/proposal/proposal-document-auto-layout";
import { PROPOSAL_DOCUMENT_CSS } from "@/lib/proposal-document-css";
import { proposalToDocument } from "@/lib/proposal-document-db";
import { getProposalByShareId } from "@/services/proposals";
import { getSettings } from "@/services/settings";

export const instant = false;

type Params = Promise<{ shareId: string }>;

export default async function PublicProposalPage({ params }: { params: Params }) {
  const { shareId } = await params;
  const [proposal, settings] = await Promise.all([getProposalByShareId(shareId), getSettings()]);

  if (!proposal) {
    notFound();
  }

  const document = proposalToDocument(proposal, settings);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROPOSAL_DOCUMENT_CSS }} />
      <main className="doc-public-shell">
        <div className="doc-public-bar">
          <span className="doc-public-bar-title">{document.code ?? "Proposta"}</span>
          <a href={`/api/propostas/publicas/${shareId}/pdf`} className="doc-public-print">
            Baixar PDF
          </a>
        </div>
        <ProposalDocumentAutoLayout document={document} />
      </main>
    </>
  );
}
