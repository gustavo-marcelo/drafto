"use client";

import { useEffect } from "react";

import { reportClientError } from "@/lib/report-client-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { boundary: "root-error" });
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-primary-900 text-2xl font-semibold">Algo deu errado</h1>
      <p className="text-primary-700 max-w-md text-sm">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
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
