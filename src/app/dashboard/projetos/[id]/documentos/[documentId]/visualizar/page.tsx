import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownDownloadButton } from "@/components/features/markdown-download-button";
import { MarkdownView } from "@/components/features/markdown-view";
import { PrintButton } from "@/components/features/print-button";
import { DocumentBrandHeader } from "@/components/proposal/proposal-document-parts";
import { verifySession } from "@/lib/auth";
import { PROJECT_DOCUMENT_CSS } from "@/lib/project-document-css";
import { getProjectById, getProjectDocument } from "@/services/projects";
import { getSettings } from "@/services/settings";

type Params = Promise<{ id: string; documentId: string }>;

export const instant = false;

export default async function ProjectDocumentViewPage({ params }: { params: Params }) {
  await verifySession();

  const { id, documentId } = await params;
  const [project, document, settings] = await Promise.all([
    getProjectById(id),
    getProjectDocument(id, documentId),
    getSettings(),
  ]);

  if (!project || !document) {
    notFound();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROJECT_DOCUMENT_CSS }} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href={`/dashboard/projetos/${project.id}`}
              className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
            >
              ← Voltar para {project.name}
            </Link>
            <h1 className="text-primary-900 text-2xl font-semibold">{document.title}</h1>
            <p className="text-primary-700 text-sm">
              Documento Markdown do projeto {project.name}.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href={`/api/projetos/${project.id}/documentos/${document.id}/pdf`}
              className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Baixar PDF
            </a>
            <MarkdownDownloadButton title={document.title} content={document.content} />
            <PrintButton />
            <Link
              href={`/dashboard/projetos/${project.id}/documentos/${document.id}`}
              className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 text-sm transition-colors"
            >
              Editar
            </Link>
          </div>
        </div>

        <article className="markdown-doc-sheet">
          <DocumentBrandHeader
            settings={settings}
            meta={
              <>
                Documento <strong>{document.title}</strong>
                <br />
                {project.name}
              </>
            }
          />
          <MarkdownView content={document.content} />
        </article>
      </div>
    </>
  );
}
