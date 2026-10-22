import Link from "next/link";

import { ProjectRowActions } from "@/components/features/project-row-actions";
import { verifySession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listProjects } from "@/services/projects";

type SearchParams = Promise<{ q?: string }>;

export const instant = false;

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  await verifySession();
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const projects = await listProjects(q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-primary-900 text-2xl font-semibold">Projetos</h1>
          <p className="text-primary-700 text-sm">
            Projetos vinculados a clientes, com documentos anexados em Markdown.
          </p>
        </div>
        <Link
          href="/dashboard/projetos/novo"
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors"
        >
          Novo projeto
        </Link>
      </div>

      <form className="flex items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por projeto, descrição, cliente ou código..."
          className="border-primary-200 focus:border-primary-500 w-full rounded-md border px-3 py-2 outline-none sm:max-w-sm"
        />
        <button
          type="submit"
          className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-2 text-sm transition-colors"
        >
          Buscar
        </button>
      </form>

      {projects.length === 0 ? (
        <div className="border-primary-200 rounded-lg border border-dashed bg-white p-10 text-center">
          <p className="text-primary-700">Nenhum projeto encontrado.</p>
        </div>
      ) : (
        <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Documentos</th>
                <th className="px-4 py-3 font-medium">Propostas</th>
                <th className="px-4 py-3 font-medium">Atualizado</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-primary-50 border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/projetos/${project.id}`}
                      className="text-primary-900 hover:text-primary-700 font-medium"
                    >
                      {project.name}
                    </Link>
                    <p className="text-primary-600 line-clamp-2 text-xs">{project.description}</p>
                  </td>
                  <td className="text-primary-700 px-4 py-3">
                    {project.client.name}
                    {project.client.clientCode && (
                      <span className="text-primary-500 block text-xs">
                        {project.client.clientCode}
                      </span>
                    )}
                  </td>
                  <td className="text-primary-700 px-4 py-3">{project._count.documents}</td>
                  <td className="text-primary-700 px-4 py-3">{project._count.proposals}</td>
                  <td className="text-primary-700 px-4 py-3">{formatDate(project.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/projetos/${project.id}`}
                        className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                      >
                        Abrir
                      </Link>
                      <ProjectRowActions id={project.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
