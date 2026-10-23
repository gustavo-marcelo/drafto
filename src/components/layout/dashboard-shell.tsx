"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import {
  IconClose,
  IconFileText,
  IconFolder,
  IconLayers,
  IconMenu,
  IconPackage,
  IconSettings,
  IconTool,
  IconUsers,
} from "@/components/layout/icons";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/projetos", label: "Projetos", icon: IconFolder },
  { href: "/dashboard", label: "Propostas", icon: IconFileText, exact: true },
  { href: "/dashboard/clientes", label: "Clientes", icon: IconUsers },
  { href: "/dashboard/pacotes", label: "Pacotes", icon: IconPackage },
  { href: "/dashboard/recursos", label: "Recursos", icon: IconLayers },
  { href: "/dashboard/infraestrutura", label: "Infraestrutura e operação", icon: IconTool },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: IconSettings },
  { href: "/dashboard/usuarios", label: "Usuários", icon: IconUsers },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DashboardShell({
  children,
  userSlot,
}: {
  children: ReactNode;
  userSlot: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <a
        href="#conteudo"
        className="focus:bg-primary-600 sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:text-white print:hidden"
      >
        Pular para o conteúdo
      </a>
      <div className="flex flex-1">
        {open && (
          <div
            className="bg-primary-950/40 fixed inset-0 z-30 lg:hidden print:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`border-primary-100 fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 print:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-primary-100 flex h-16 shrink-0 items-center justify-between border-b px-4">
            <Link
              href="/dashboard"
              className="text-primary-900 flex items-center gap-2 font-semibold"
            >
              <Image src="/logo.png" alt="" width={28} height={28} preload className="h-7 w-7" />
              <span className="text-base">Proposta.ai</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="text-primary-600 hover:bg-primary-50 rounded-md p-1.5 transition-colors lg:hidden"
            >
              <IconClose />
            </button>
          </div>

          <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "text-primary-700 hover:bg-primary-50 hover:text-primary-900"
                  }`}
                >
                  <Icon className={active ? "text-white" : "text-primary-500"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-primary-100 sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 sm:px-6 print:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={open}
              className="border-primary-200 text-primary-800 hover:bg-primary-50 inline-flex items-center justify-center rounded-md border p-2 transition-colors lg:hidden"
            >
              <IconMenu />
            </button>
            <div className="ml-auto flex items-center gap-3">{userSlot}</div>
          </header>
          <main
            id="conteudo"
            className="bg-primary-50 flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 print:bg-white print:p-0"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
