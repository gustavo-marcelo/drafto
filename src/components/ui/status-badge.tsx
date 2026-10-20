import type { ProposalStatus } from "@prisma/client";

import { STATUS_LABELS, STATUS_STYLES } from "@/lib/proposal-status";

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
