"use client";

import { useState } from "react";

import { logout } from "@/app/actions/auth";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ name, email }: { name: string | null; email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu do usuário"
        className="border-primary-200 hover:bg-primary-50 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 transition-colors"
      >
        <span className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white">
          {initials(name ?? "", email)}
        </span>
        <span className="text-primary-800 hidden text-sm font-medium sm:inline">
          {name ?? email}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="border-primary-100 absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border bg-white shadow-lg"
          >
            <div className="border-primary-100 border-b px-4 py-3">
              <p className="text-primary-900 truncate text-sm font-semibold">{name ?? "—"}</p>
              <p className="text-primary-600 truncate text-xs">{email}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-primary-800 hover:bg-primary-50 w-full px-4 py-2.5 text-left text-sm transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
