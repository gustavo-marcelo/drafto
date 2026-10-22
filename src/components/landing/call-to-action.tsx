import Link from "next/link";

import { IconArrowRight } from "./icons";

export function CallToAction() {
  return (
    <section className="bg-primary-800 py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
          Sua próxima proposta pode estar pronta em cinco minutos
        </h2>
        <p className="text-primary-100 max-w-xl leading-relaxed">
          Entre no sistema, escolha os recursos do seu catálogo e exporte o PDF com a sua marca.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="bg-accent-500 hover:bg-accent-600 text-primary-950 inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-medium transition-colors"
          >
            Entrar no sistema
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="border-primary-500 hover:bg-primary-700 inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium text-white transition-colors"
          >
            Sobre o projeto
          </Link>
        </div>
      </div>
    </section>
  );
}
