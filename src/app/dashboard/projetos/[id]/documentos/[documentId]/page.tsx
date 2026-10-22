import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectDocumentForm } from "@/components/features/project-document-form";
import { verifySession } from "@/lib/auth";
import { getProjectById, getProjectDocument } from "@/services/projects";

type Params = Promise<{ id: string; documentId: string }>;

export const instant = false;

export default async function EditProjectDocumentPage({ params }: { params: Params }) {
  await verifySession();

  const { id, documentId } = await params;
  const [project, document] = await Promise.all([
    getProjectById(id),
    getProjectDocument(id, documentId),
  ]);

  if (!project || !document) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Link
            href={`/dashboard/projetos/${project.id}`}
            className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
          >
            ← Voltar para {project.name}
          </Link>
          <h1 className="text-primary-900 text-2xl font-semibold">{document.title}</h1>
          <p className="text-primary-700 text-sm">Documento Markdown do projeto {project.name}.</p>
        </div>
        <Link
          href={`/dashboard/projetos/${project.id}/documentos/${document.id}/visualizar`}
          className="border-primary-200 text-primary-800 hover:bg-primary-50 shrink-0 rounded-md border px-4 py-2 text-sm transition-colors"
        >
          Visualizar
        </Link>
      </div>

      <ProjectDocumentForm
        projectId={project.id}
        documentId={document.id}
        initialData={{ title: document.title, content: document.content }}
      />
    </div>
  );
}
