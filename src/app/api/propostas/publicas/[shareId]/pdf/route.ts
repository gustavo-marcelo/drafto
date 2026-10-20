import { NextResponse } from "next/server";

import { proposalToDocument } from "@/lib/proposal-document-db";
import { renderProposalPdf } from "@/services/proposal-pdf";
import { getProposalByShareId } from "@/services/proposals";
import { getSettings } from "@/services/settings";

type Params = Promise<{ shareId: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { shareId } = await params;
  const [proposal, settings] = await Promise.all([getProposalByShareId(shareId), getSettings()]);

  if (!proposal) {
    return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
  }

  const document = proposalToDocument(proposal, settings);
  const pdf = await renderProposalPdf(document);

  const filename = `${proposal.code ?? "proposta"}-${proposal.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
