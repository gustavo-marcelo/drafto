import Link from "next/link";

import { PackageRowActions } from "@/components/features/package-row-actions";
import { verifySession } from "@/lib/auth";
import { parsePackagePayload } from "@/lib/package-payload";
import { listPackagesFull } from "@/services/packages";

export const instant = false;

export default async function PackagesPage() {
  await verifySession();
  const packages = await listPackagesFull();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-primary-900 text-2xl font-semibold">Pacotes padrão</h1>
        <Link
          href="/dashboard/pacotes/novo"
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors"
        >
          Novo pacote
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="border-primary-200 rounded-lg border border-dashed bg-white p-10 text-center">
          <p className="text-primary-700">Nenhum pacote cadastrado.</p>
        </div>
      ) : (
        <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Público</th>
                <th className="px-4 py-3 font-medium">Recursos</th>
                <th className="px-4 py-3 font-medium">Equipamentos</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const payload = parsePackagePayload(pkg.payload);
                return (
                  <tr key={pkg.id} className="border-primary-50 border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/pacotes/${pkg.id}`}
                        className="text-primary-900 hover:text-primary-700 font-medium"
                      >
                        {pkg.name}
                      </Link>
                      {pkg.description && (
                        <p className="text-primary-600 text-xs">{pkg.description}</p>
                      )}
                    </td>
                    <td className="text-primary-700 px-4 py-3">{pkg.audience ?? "—"}</td>
                    <td className="text-primary-700 px-4 py-3">{payload.recursos?.length ?? 0}</td>
                    <td className="text-primary-700 px-4 py-3">
                      {payload.equipamentos?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/pacotes/${pkg.id}`}
                          className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                        >
                          Editar
                        </Link>
                        <PackageRowActions id={pkg.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
