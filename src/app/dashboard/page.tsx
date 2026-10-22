import Link from "next/link";
import { Suspense } from "react";

import { ProposalFilters } from "@/components/features/proposal-filters";
import { ProposalRowActions } from "@/components/features/proposal-row-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { verifySession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { expireOverdueProposals } from "@/services/expiration";
import { listProposals } from "@/services/proposals";
import { proposalFilterSchema } from "@/lib/validations/proposal";

type SearchParams = Promise<{ q?: string; status?: string }>;

export const instant = false;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-primary-900 text-2xl font-semibold">Propostas</h1>
        <Link
          href="/dashboard/propostas/nova"
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors"
        >
          Nova proposta
        </Link>
      </div>

      <Suspense fallback={<p className="text-primary-400">Carregando filtros...</p>}>
        <ProposalFilters />
      </Suspense>

      <Suspense fallback={<p className="text-primary-400">Carregando propostas...</p>}>
        <ProposalList q={params.q} status={params.status} />
      </Suspense>
    </div>
  );
}

async function ProposalList({ q, status }: { q?: string; status?: string }) {
  await verifySession();
  await expireOverdueProposals();

  const filters = proposalFilterSchema.parse({ q, status });
  const proposals = await listProposals({
    q: filters.q,
    status: filters.status ? filters.status : undefined,
  });

  if (proposals.length === 0) {
    return (
      <div className="border-primary-200 rounded-lg border border-dashed bg-white p-10 text-center">
        <p className="text-primary-700">Nenhuma proposta encontrada.</p>
        <Link
          href="/dashboard/propostas/nova"
          className="text-accent-900 mt-2 inline-block text-sm font-medium hover:underline"
        >
          Criar a primeira proposta
        </Link>
      </div>
    );
  }

  return (
    <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Código
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Título
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Cliente
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Projeto
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Evento
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Valor
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal) => (
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
              <td className="text-primary-700 px-4 py-3">{proposal.clientName ?? "—"}</td>
              <td className="text-primary-700 px-4 py-3">
                {proposal.projectId && proposal.projectName ? (
                  <Link
                    href={`/dashboard/projetos/${proposal.projectId}`}
                    className="hover:text-primary-900 underline-offset-2 hover:underline"
                  >
                    {proposal.projectName}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="text-primary-700 px-4 py-3">{formatDate(proposal.eventDate)}</td>
              <td className="text-primary-700 px-4 py-3">{formatCurrency(proposal.totalAmount)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={proposal.status} />
              </td>
              <td className="px-4 py-3">
                <ProposalRowActions id={proposal.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
