"use client";

import { useEffect } from "react";

import { reportClientError } from "@/lib/report-client-error";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { boundary: "global-error" });
  }, [error]);

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-primary-900 text-2xl font-semibold">Erro inesperado</h1>
        <p className="text-primary-700 max-w-md text-sm">
          Não foi possível carregar a aplicação. Recarregue a página para tentar novamente.
        </p>
        {error.digest && <p className="text-primary-400 text-xs">Código: {error.digest}</p>}
        <button
          type="button"
          onClick={reset}
          className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors"
        >
          Recarregar
        </button>
      </body>
    </html>
  );
}
