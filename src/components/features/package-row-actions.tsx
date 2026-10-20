"use client";

import { toast } from "sonner";

import { deletePackage } from "@/app/actions/packages";

export function PackageRowActions({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        toast.success("Pacote excluído.");
        await deletePackage(id);
      }}
      onSubmit={(event) => {
        if (!confirm("Excluir este pacote? As propostas existentes não serão afetadas.")) {
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
