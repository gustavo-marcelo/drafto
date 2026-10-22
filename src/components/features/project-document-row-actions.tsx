"use client";

import { toast } from "sonner";

import { deleteProjectDocument } from "@/app/actions/projects";

export function ProjectDocumentRowActions({
  projectId,
  documentId,
}: {
  projectId: string;
  documentId: string;
}) {
  return (
    <form
      action={async () => {
        toast.success("Documento excluído.");
        await deleteProjectDocument(projectId, documentId);
      }}
      onSubmit={(event) => {
        if (!confirm("Excluir este documento?")) {
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
