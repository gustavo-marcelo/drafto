"use client";

import { toast } from "sonner";

import { deleteProject } from "@/app/actions/projects";

export function ProjectRowActions({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        toast.success("Projeto excluído.");
        await deleteProject(id);
      }}
      onSubmit={(event) => {
        if (
          !confirm(
            "Excluir este projeto e todos os documentos anexados? As propostas vinculadas serão desvinculadas.",
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
