"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { PROPOSAL_STATUSES, STATUS_LABELS } from "@/lib/proposal-status";

export function ProposalFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";

  function updateParams(next: { q?: string; status?: string }) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        aria-label="Buscar propostas"
        placeholder="Buscar por título, cliente ou código..."
        defaultValue={q}
        onChange={(event) => updateParams({ q: event.target.value })}
        className="border-primary-200 focus:border-primary-500 w-full rounded-md border px-3 py-2 outline-none sm:max-w-sm"
      />
      <select
        aria-label="Filtrar por status"
        defaultValue={status}
        onChange={(event) => updateParams({ status: event.target.value })}
        className="border-primary-200 focus:border-primary-500 rounded-md border px-3 py-2 outline-none"
      >
        <option value="">Todos os status</option>
        {PROPOSAL_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      {pending && <span className="text-primary-400 text-sm">Filtrando...</span>}
    </div>
  );
}
