import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectDocumentForm } from "@/components/features/project-document-form";
import { verifySession } from "@/lib/auth";
import { getProjectById } from "@/services/projects";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function NewProjectDocumentPage({ params }: { params: Params }) {
  await verifySession();

  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/projetos/${project.id}`}
          className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
        >
          ← Voltar para {project.name}
        </Link>
        <h1 className="text-primary-900 text-2xl font-semibold">Novo documento</h1>
        <p className="text-primary-700 text-sm">Documento Markdown do projeto {project.name}.</p>
      </div>

      <ProjectDocumentForm projectId={project.id} />
    </div>
  );
}
