import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectDocumentRowActions } from "@/components/features/project-document-row-actions";
import { ProjectForm } from "@/components/features/project-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { verifySession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listClientOptions } from "@/services/clients";
import { getProjectById } from "@/services/projects";

type Params = Promise<{ id: string }>;

export const instant = false;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  await verifySession();

  const { id } = await params;
  const [project, clients] = await Promise.all([getProjectById(id), listClientOptions()]);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/projetos"
          className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
        >
          ← Voltar para projetos
        </Link>
        <h1 className="text-primary-900 text-2xl font-semibold">{project.name}</h1>
        <p className="text-primary-700 text-sm">
          Cliente: <span className="font-medium">{project.client.name}</span>
          {project.client.clientCode ? ` · ${project.client.clientCode}` : ""}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-primary-900 text-lg font-semibold">Dados do projeto</h2>
        <ProjectForm
          clients={clients}
          projectId={project.id}
          initialData={{
            name: project.name,
            description: project.description,
            clientId: project.clientId,
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-primary-900 text-lg font-semibold">Documentos anexados</h2>
            <p className="text-primary-700 text-sm">
              Documentos em Markdown vinculados a este projeto.
            </p>
          </div>
          <Link
            href={`/dashboard/projetos/${project.id}/documentos/novo`}
            className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 text-sm transition-colors"
          >
            Novo documento
          </Link>
        </div>

        {project.documents.length === 0 ? (
          <div className="border-primary-200 rounded-lg border border-dashed bg-white p-8 text-center">
            <p className="text-primary-700">Nenhum documento anexado.</p>
          </div>
        ) : (
          <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Documento</th>
                  <th className="px-4 py-3 font-medium">Atualizado</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {project.documents.map((document) => (
                  <tr key={document.id} className="border-primary-50 border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/projetos/${project.id}/documentos/${document.id}`}
                        className="text-primary-900 hover:text-primary-700 font-medium"
                      >
                        {document.title}
                      </Link>
                    </td>
                    <td className="text-primary-700 px-4 py-3">{formatDate(document.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/projetos/${project.id}/documentos/${document.id}/visualizar`}
                          className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                        >
                          Visualizar
                        </Link>
                        <Link
                          href={`/dashboard/projetos/${project.id}/documentos/${document.id}`}
                          className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                        >
                          Editar
                        </Link>
                        <ProjectDocumentRowActions
                          projectId={project.id}
                          documentId={document.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-primary-900 text-lg font-semibold">Propostas vinculadas</h2>
          <p className="text-primary-700 text-sm">
            Propostas associadas a este projeto para acesso rápido aos documentos.
          </p>
        </div>

        {project.proposals.length === 0 ? (
          <div className="border-primary-200 rounded-lg border border-dashed bg-white p-8 text-center">
            <p className="text-primary-700">Nenhuma proposta vinculada.</p>
          </div>
        ) : (
          <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Proposta</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Atualizada</th>
                </tr>
              </thead>
              <tbody>
                {project.proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-primary-50 border-b last:border-0">
                    <td className="text-primary-700 px-4 py-3">
                      {proposal.code ? <code className="text-xs">{proposal.code}</code> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/propostas/${proposal.id}`}
                        className="text-primary-900 hover:text-primary-700 font-medium"
                      >
                        {proposal.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="text-primary-700 px-4 py-3">{formatDate(proposal.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
