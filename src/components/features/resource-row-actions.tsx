"use client";

import { toast } from "sonner";

import { deleteResource } from "@/app/actions/resources";

export function ResourceRowActions({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        toast.success("Recurso excluído.");
        await deleteResource(id);
      }}
      onSubmit={(event) => {
        if (
          !confirm("Excluir este recurso? Propostas e pacotes já existentes não serão alterados.")
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
