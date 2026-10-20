import Link from "next/link";

import { ResourceRowActions } from "@/components/features/resource-row-actions";
import { verifySession } from "@/lib/auth";
import { listAllResources } from "@/services/resources";

export const instant = false;

export default async function ResourcesPage() {
  await verifySession();
  const resources = await listAllResources();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-primary-900 text-2xl font-semibold">Recursos</h1>
        <Link
          href="/dashboard/recursos/novo"
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors"
        >
          Novo recurso
        </Link>
      </div>
      <p className="text-primary-700 text-sm">
        Catálogo usado nos pacotes padrões e no passo de módulos das propostas.
      </p>

      {resources.length === 0 ? (
        <div className="border-primary-200 rounded-lg border border-dashed bg-white p-10 text-center">
          <p className="text-primary-700">Nenhum recurso cadastrado.</p>
        </div>
      ) : (
        <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Ordem</th>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Chave</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="border-primary-50 border-b last:border-0">
                  <td className="text-primary-700 px-4 py-3">{resource.position}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/recursos/${resource.id}`}
                      className="text-primary-900 hover:text-primary-700 font-medium"
                    >
                      {resource.title}
                    </Link>
                    {resource.description && (
                      <p className="text-primary-600 text-xs">{resource.description}</p>
                    )}
                  </td>
                  <td className="text-primary-700 px-4 py-3">
                    <code className="text-xs">{resource.key}</code>
                  </td>
                  <td className="px-4 py-3">
                    {resource.active ? (
                      <span className="text-accent-900 text-xs font-medium">Ativo</span>
                    ) : (
                      <span className="text-primary-500 text-xs font-medium">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/recursos/${resource.id}`}
                        className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                      >
                        Editar
                      </Link>
                      <ResourceRowActions id={resource.id} />
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
