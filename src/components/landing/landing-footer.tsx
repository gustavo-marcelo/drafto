import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/login", label: "Entrar" },
  { href: "/about", label: "Sobre o projeto" },
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#duvidas", label: "Dúvidas" },
];

export function LandingFooter() {
  return (
    <section aria-label="Rodapé" className="border-primary-100 bg-primary-50 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={32} height={32} preload className="h-8 w-8" />
            <span className="text-primary-900 text-base font-semibold tracking-tight">
              Proposta.ai
            </span>
          </div>
          <p className="text-primary-700 mt-4 text-sm leading-relaxed">
            Gerador de propostas comerciais para empresas de credenciamento e gestão de eventos.
          </p>
        </div>

        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-primary-700 hover:text-primary-900 text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
