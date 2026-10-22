"use client";

import { useState } from "react";

import { IconClose, IconMenu } from "@/components/layout/icons";

const NAV_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#documento", label: "O documento" },
  { href: "#duvidas", label: "Dúvidas" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="border-primary-200 text-primary-800 hover:bg-primary-50 flex h-10 w-10 items-center justify-center rounded-md border transition-colors"
      >
        {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
      </button>

      {open ? (
        <div
          id="menu-mobile"
          className="border-primary-100 absolute inset-x-0 top-16 border-b bg-white p-4 shadow-sm"
        >
          <nav aria-label="Navegação mobile" className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-primary-800 hover:bg-primary-50 rounded-md px-2 py-3 text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
