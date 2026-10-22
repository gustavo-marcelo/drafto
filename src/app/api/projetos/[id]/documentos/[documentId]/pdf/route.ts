import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/catalog";
import { getProjectById, getProjectDocument } from "@/services/projects";
import { renderProjectDocumentPdf } from "@/services/project-document-pdf";
import { getSettings } from "@/services/settings";

type Params = Promise<{ id: string; documentId: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  await verifySession();

  const { id, documentId } = await params;
  const [project, document, settings] = await Promise.all([
    getProjectById(id),
    getProjectDocument(id, documentId),
    getSettings(),
  ]);

  if (!project || !document) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  const pdf = await renderProjectDocumentPdf({
    projectName: project.name,
    title: document.title,
    content: document.content,
    settings,
  });

  const filename = (slugify(`${project.name}-${document.title}`) || "documento").slice(0, 80);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
