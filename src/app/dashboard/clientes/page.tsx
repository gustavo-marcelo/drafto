import Link from "next/link";

import { ClientRowActions } from "@/components/features/client-row-actions";
import { verifySession } from "@/lib/auth";
import { formatAddress } from "@/lib/format";
import { listClients } from "@/services/clients";

type SearchParams = Promise<{ q?: string; error?: string }>;

export const instant = false;

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  await verifySession();
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const clients = await listClients(q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-primary-900 text-2xl font-semibold">Clientes</h1>
        <Link
          href="/dashboard/clientes/novo"
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors"
        >
          Novo cliente
        </Link>
      </div>

      {params.error === "vinculada" && (
        <p className="border-accent-200 bg-accent-50 text-accent-900 rounded-md border px-4 py-3 text-sm">
          Este cliente possui propostas ou projetos vinculados e não pode ser excluído.
        </p>
      )}

      <form className="flex items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, CNPJ/CPF, código, e-mail ou telefone..."
          className="border-primary-200 focus:border-primary-500 w-full rounded-md border px-3 py-2 outline-none sm:max-w-sm"
        />
        <button
          type="submit"
          className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-2 text-sm transition-colors"
        >
          Buscar
        </button>
      </form>

      {clients.length === 0 ? (
        <div className="border-primary-200 rounded-lg border border-dashed bg-white p-10 text-center">
          <p className="text-primary-700">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">CNPJ / CPF</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Propostas</th>
                <th className="px-4 py-3 font-medium">Projetos</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-primary-50 border-b last:border-0">
                  <td className="text-primary-700 px-4 py-3">{client.clientCode ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/clientes/${client.id}`}
                      className="text-primary-900 hover:text-primary-700 font-medium"
                    >
                      {client.name}
                    </Link>
                    {formatAddress(client) && (
                      <p className="text-primary-600 text-xs">{formatAddress(client)}</p>
                    )}
                    {(client.phone || client.email) && (
                      <p className="text-primary-600 text-xs">
                        {[client.phone, client.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="text-primary-700 px-4 py-3">{client.document ?? "—"}</td>
                  <td className="text-primary-700 px-4 py-3">{client.contact ?? "—"}</td>
                  <td className="text-primary-700 px-4 py-3">{client._count.proposals}</td>
                  <td className="text-primary-700 px-4 py-3">{client._count.projects}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/clientes/${client.id}`}
                        className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                      >
                        Editar
                      </Link>
                      <ClientRowActions
                        id={client.id}
                        hasLinks={client._count.proposals > 0 || client._count.projects > 0}
                      />
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
