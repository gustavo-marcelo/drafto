import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-accent-600 text-sm font-medium tracking-wide uppercase">404</p>
      <h1 className="text-primary-900 text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-primary-700 max-w-md text-sm">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        href="/dashboard"
        className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors"
      >
        Ir para o dashboard
      </Link>
    </div>
  );
}
