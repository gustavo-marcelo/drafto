"use client";

import { toast } from "sonner";

import { deleteClient } from "@/app/actions/clients";

export function ClientRowActions({ id, hasLinks }: { id: string; hasLinks: boolean }) {
  return (
    <form
      action={async () => {
        toast.success("Cliente excluído.");
        await deleteClient(id);
      }}
      onSubmit={(event) => {
        if (!confirm("Excluir este cliente?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={hasLinks}
        title={
          hasLinks
            ? "Cliente possui propostas ou projetos vinculados e não pode ser excluído."
            : undefined
        }
        className="rounded-md px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Excluir
      </button>
    </form>
  );
}
