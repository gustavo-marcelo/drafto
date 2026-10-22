"use client";

import { useActionState } from "react";

import { login } from "@/app/actions/auth";
import { APP_COMMIT } from "@/lib/app-version";
import type { AuthFormState } from "@/lib/validations/auth";

export function AuthForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(login, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-primary-900 text-2xl font-semibold">Entrar</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-primary-800 text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="border-primary-200 focus:border-primary-500 rounded-md border px-3 py-2 outline-none"
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-600">{state.errors.email.join(" ")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-primary-800 text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="border-primary-200 focus:border-primary-500 rounded-md border px-3 py-2 outline-none"
        />
        {state?.errors?.password && (
          <p className="text-sm text-red-600">{state.errors.password.join(" ")}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors disabled:opacity-60"
      >
        {pending ? "Aguarde..." : "Entrar"}
      </button>

      <p className="text-primary-500 text-center text-xs">Versão {APP_COMMIT}</p>
    </form>
  );
}
