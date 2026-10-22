"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveInfrastructure } from "@/app/actions/infrastructures";
import { Field, inputClass } from "@/components/ui/field";
import { slugify } from "@/lib/catalog";
import type { InfrastructureInput } from "@/lib/validations/infrastructure";

const EMPTY: InfrastructureInput = {
  title: "",
  description: "",
  position: 0,
  active: true,
};

type InfrastructureFormProps = {
  initialData?: Partial<InfrastructureInput>;
  infrastructureId?: string;
  infrastructureKey?: string;
};

export function InfrastructureForm({
  initialData,
  infrastructureId,
  infrastructureKey,
}: InfrastructureFormProps) {
  const router = useRouter();
  const [data, setData] = useState<InfrastructureInput>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof InfrastructureInput>(key: K, value: InfrastructureInput[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      const result = await saveInfrastructure(data, infrastructureId);
      if (result.ok) {
        router.push("/dashboard/infraestrutura");
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos destacados.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-primary-100 flex max-w-2xl flex-col gap-4 rounded-lg border bg-white p-6">
        <Field label="Título do item" name="title" errors={errors.title}>
          <input
            id="title"
            type="text"
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ex: Totens de autoatendimento"
            className={inputClass}
          />
        </Field>

        <Field label="Descrição" name="description" errors={errors.description}>
          <textarea
            id="description"
            rows={2}
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ordem de exibição" name="position" errors={errors.position}>
            <input
              id="position"
              type="number"
              min={0}
              value={data.position}
              onChange={(e) => update("position", Number(e.target.value))}
              className={inputClass}
            />
          </Field>

          <div className="flex flex-col justify-end gap-1">
            <span className="text-primary-800 text-sm font-medium">Chave (gerada do título)</span>
            <code className="border-primary-200 text-primary-700 bg-primary-50 rounded-md border px-3 py-2 text-sm">
              {infrastructureKey ?? (slugify(data.title) || "—")}
            </code>
          </div>
        </div>

        <label className="text-primary-800 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={data.active}
            onChange={(e) => update("active", e.target.checked)}
          />
          Ativo (aparece na seleção de infraestrutura)
        </label>

        {message && <p className="text-sm text-red-600">{message}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
          >
            {pending ? "Salvando..." : infrastructureId ? "Salvar alterações" : "Criar item"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/infraestrutura")}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
