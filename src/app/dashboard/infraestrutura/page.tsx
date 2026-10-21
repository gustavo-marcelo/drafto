import Link from "next/link";

import { InfrastructureRowActions } from "@/components/features/infrastructure-row-actions";
import { verifySession } from "@/lib/auth";
import { listAllInfrastructures } from "@/services/infrastructures";

export const instant = false;

export default async function InfrastructuresPage() {
  await verifySession();
  const infrastructures = await listAllInfrastructures();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-primary-900 text-2xl font-semibold">Infraestrutura e operação</h1>
        <Link
          href="/dashboard/infraestrutura/novo"
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors"
        >
          Novo item
        </Link>
      </div>
      <p className="text-primary-700 text-sm">
        Catálogo usado nos pacotes padrões e no passo de módulos das propostas.
      </p>

      {infrastructures.length === 0 ? (
        <div className="border-primary-200 rounded-lg border border-dashed bg-white p-10 text-center">
          <p className="text-primary-700">Nenhum item cadastrado.</p>
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
              {infrastructures.map((infrastructure) => (
                <tr key={infrastructure.id} className="border-primary-50 border-b last:border-0">
                  <td className="text-primary-700 px-4 py-3">{infrastructure.position}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/infraestrutura/${infrastructure.id}`}
                      className="text-primary-900 hover:text-primary-700 font-medium"
                    >
                      {infrastructure.title}
                    </Link>
                    {infrastructure.description && (
                      <p className="text-primary-600 text-xs">{infrastructure.description}</p>
                    )}
                  </td>
                  <td className="text-primary-700 px-4 py-3">
                    <code className="text-xs">{infrastructure.key}</code>
                  </td>
                  <td className="px-4 py-3">
                    {infrastructure.active ? (
                      <span className="text-accent-900 text-xs font-medium">Ativo</span>
                    ) : (
                      <span className="text-primary-500 text-xs font-medium">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/infraestrutura/${infrastructure.id}`}
                        className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                      >
                        Editar
                      </Link>
                      <InfrastructureRowActions id={infrastructure.id} />
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
