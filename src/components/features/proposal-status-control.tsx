"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProposalStatus } from "@/app/actions/proposals";
import { allowedStatuses, STATUS_LABELS, STATUS_STYLES } from "@/lib/proposal-status";
import type { ProposalStatus } from "@prisma/client";

export function ProposalStatusControl({
  proposalId,
  status,
}: {
  proposalId: string;
  status: ProposalStatus;
}) {
  const [selected, setSelected] = useState<ProposalStatus | null>(null);
  const [pending, startTransition] = useTransition();

  const current = selected ?? status;
  const options = allowedStatuses(current);

  function change(next: ProposalStatus) {
    if (next === current) return;
    setSelected(next);
    startTransition(async () => {
      const result = await updateProposalStatus(proposalId, next);
      if (result.ok) {
        toast.success(`Status alterado para "${STATUS_LABELS[next]}".`);
      } else {
        setSelected(null);
        toast.error(result.message ?? "Não foi possível alterar o status.");
      }
    });
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-primary-700 text-xs font-medium tracking-wide uppercase">Status</span>
      <select
        id="proposal-status"
        value={current}
        onChange={(event) => change(event.target.value as ProposalStatus)}
        disabled={pending || options.length === 1}
        className={`border-primary-200 focus:border-primary-500 cursor-pointer rounded-md border px-2 py-1 text-sm font-medium transition-colors outline-none disabled:cursor-default disabled:opacity-70 ${STATUS_STYLES[current]}`}
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
