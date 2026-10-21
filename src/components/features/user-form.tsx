"use client";

import { useState, useTransition } from "react";

import { createUser, updateUser } from "@/app/actions/users";
import { Field, inputClass } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { formatPhone } from "@/lib/format";

const EMPTY = { name: "", email: "", phone: "", password: "" };

type UserFormProps = {
  userId?: string;
  initialData?: { name: string; email: string; phone?: string };
  onDone?: (email: string) => void;
  onCancel?: () => void;
};

export function UserForm({ userId, initialData, onDone, onCancel }: UserFormProps) {
  const isEdit = Boolean(userId);
  const [form, setForm] = useState({
    ...EMPTY,
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setErrors({});
    setMessage(null);
    setSuccess(null);
    startTransition(async () => {
      const result = isEdit ? await updateUser(userId!, form) : await createUser(form);
      if (result.ok) {
        if (isEdit) {
          onDone?.(result.user.email);
        } else {
          setForm(EMPTY);
          setSuccess(`Usuário ${result.user.email} criado.`);
        }
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos destacados.");
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="border-primary-100 flex max-w-3xl flex-col gap-4 rounded-lg border bg-white p-6"
    >
      <h2 className="text-primary-900 text-lg font-semibold">
        {isEdit ? "Editar usuário" : "Novo usuário"}
      </h2>

      <Field label="Nome" name="name" errors={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className={inputClass}
        />
      </Field>

      <Field label="E-mail" name="email" errors={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className={inputClass}
        />
      </Field>

      <Field label="Telefone" name="phone" errors={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          value={formatPhone(form.phone)}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, phone: formatPhone(event.target.value) }))
          }
          placeholder="(00) 00000-0000"
          className={inputClass}
        />
      </Field>

      <Field
        label={isEdit ? "Nova senha (deixe em branco para manter)" : "Senha"}
        name="password"
        errors={errors.password}
      >
        <PasswordInput
          id="password"
          name="password"
          value={form.password}
          onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
        />
      </Field>

      {message && <p className="text-sm text-red-600">{message}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar usuário"}
        </button>
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
