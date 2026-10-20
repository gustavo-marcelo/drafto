import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-primary-50 flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-primary-900 text-3xl font-semibold">Proposta.ai</h1>
        <p className="text-primary-700">Gerador de propostas comerciais</p>
      </div>
      <Link
        href="/login"
        className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors"
      >
        Entrar
      </Link>
      <Link
        href="/about"
        className="text-primary-600 hover:text-primary-800 text-sm underline-offset-4 hover:underline"
      >
        Sobre o Proposta.ai
      </Link>
    </main>
  );
}
