import Image from "next/image";
import Link from "next/link";

import { IconArrowRight } from "./icons";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#documento", label: "O documento" },
  { href: "#duvidas", label: "Dúvidas" },
];

export function LandingHeader() {
  return (
    <header className="border-primary-100 sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={32} height={32} preload className="h-8 w-8" />
          <span className="text-primary-900 text-base font-semibold tracking-tight">
            Proposta.ai
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-primary-700 hover:text-primary-900 text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="bg-primary-700 hover:bg-primary-800 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Entrar
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
