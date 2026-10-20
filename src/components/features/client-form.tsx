"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveClient } from "@/app/actions/clients";
import { ClientFields } from "@/components/features/client-fields";
import type { ClientInput } from "@/lib/validations/client";

const EMPTY: ClientInput = {
  name: "",
  address: "",
  document: "",
  contact: "",
  phone: "",
  email: "",
  clientCode: "",
};

type ClientFormProps = {
  initialData?: Partial<ClientInput>;
  clientId?: string;
};

export function ClientForm({ initialData, clientId }: ClientFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ClientInput>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveClient(form, clientId);
      if (result.ok) {
        router.push("/dashboard/clientes");
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos destacados.");
      }
    });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <ClientFields form={form} errors={errors} onChange={update} />

      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando..." : clientId ? "Salvar alterações" : "Criar cliente"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/clientes")}
          className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
