"use client";

import { toast } from "sonner";

import { deleteInfrastructure } from "@/app/actions/infrastructures";

export function InfrastructureRowActions({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        toast.success("Item de infraestrutura excluído.");
        await deleteInfrastructure(id);
      }}
      onSubmit={(event) => {
        if (
          !confirm(
            "Excluir este item de infraestrutura? Propostas e pacotes já existentes não serão alterados.",
          )
        ) {
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
  );
}
