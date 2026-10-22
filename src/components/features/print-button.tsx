"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-accent-600 hover:bg-accent-700 text-primary-950 shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors"
    >
      Imprimir
    </button>
  );
}
