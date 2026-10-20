"use client";

import { useEffect } from "react";

import { reportClientError } from "@/lib/report-client-error";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { boundary: "dashboard-error" });
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-red-100 bg-white p-8">
      <h2 className="text-lg font-semibold text-red-700">Algo deu errado</h2>
      <p className="text-primary-700 text-sm">
        Não foi possível carregar as propostas. Tente novamente.
      </p>
      {error.digest && <p className="text-primary-400 text-xs">Código: {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
        className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
