"use client";

import { toast } from "sonner";

import { duplicateProposal, deleteProposal } from "@/app/actions/proposals";

export function ProposalRowActions({ id }: { id: string }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <form
        action={async () => {
          toast.success("Proposta duplicada.");
          await duplicateProposal(id);
        }}
      >
        <button
          type="submit"
          className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
        >
          Duplicar
        </button>
      </form>
      <form
        action={async () => {
          toast.success("Proposta excluída.");
          await deleteProposal(id);
        }}
        onSubmit={(event) => {
          if (!confirm("Excluir esta proposta? Esta ação não pode ser desfeita.")) {
            event.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="rounded-md px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          Excluir
        </button>
      </form>
    </div>
  );
}
