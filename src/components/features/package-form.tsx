"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { savePackage } from "@/app/actions/packages";
import { Field, inputClass } from "@/components/ui/field";
import type { PackageData } from "@/lib/validations/package";
import type { InfrastructureOption } from "@/services/infrastructures";
import type { ResourceOption } from "@/services/resources";

const EMPTY: PackageData = {
  name: "",
  description: "",
  audience: "",
  recursos: [],
  infraestrutura: [],
};

type PackageFormProps = {
  resources: ResourceOption[];
  infrastructures: InfrastructureOption[];
  initialData?: Partial<PackageData>;
  packageId?: string;
};

export function PackageForm({
  resources,
  infrastructures,
  initialData,
  packageId,
}: PackageFormProps) {
  const router = useRouter();
  const [data, setData] = useState<PackageData>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof PackageData>(key: K, value: PackageData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRecurso(key: string) {
    update(
      "recursos",
      data.recursos.includes(key)
        ? data.recursos.filter((current) => current !== key)
        : [...data.recursos, key],
    );
  }

  function toggleInfraestrutura(key: string) {
    update(
      "infraestrutura",
      data.infraestrutura.includes(key)
        ? data.infraestrutura.filter((current) => current !== key)
        : [...data.infraestrutura, key],
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await savePackage(data, packageId);
      if (result.ok) {
        router.push("/dashboard/pacotes");
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos destacados.");
      }
    });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Field label="Nome do pacote" name="name" errors={errors.name}>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Ex: Evento até 500 pessoas"
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

      <Field label="Público sugerido" name="audience" errors={errors.audience}>
        <input
          id="audience"
          type="text"
          value={data.audience}
          onChange={(e) => update("audience", e.target.value)}
          placeholder="Ex: 500 pessoas"
          className={inputClass}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-primary-800 text-sm font-medium">
          Recursos do sistema de credenciamento
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {resources.map((resource) => {
            const checked = data.recursos.includes(resource.key);
            return (
              <label
                key={resource.id}
                className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 transition-colors ${
                  checked
                    ? "border-accent-300 bg-accent-50"
                    : "border-primary-200 hover:bg-primary-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRecurso(resource.key)}
                  className="mt-1"
                />
                <span className="flex flex-col">
                  <span className="text-primary-900 text-sm font-medium">{resource.title}</span>
                  <span className="text-primary-700 text-xs">{resource.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-primary-800 text-sm font-medium">Infraestrutura e operação</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {infrastructures.map((infrastructure) => {
            const checked = data.infraestrutura.includes(infrastructure.key);
            return (
              <label
                key={infrastructure.id}
                className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 transition-colors ${
                  checked
                    ? "border-accent-300 bg-accent-50"
                    : "border-primary-200 hover:bg-primary-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleInfraestrutura(infrastructure.key)}
                  className="mt-1"
                />
                <span className="flex flex-col">
                  <span className="text-primary-900 text-sm font-medium">
                    {infrastructure.title}
                  </span>
                  <span className="text-primary-700 text-xs">{infrastructure.description}</span>
                </span>
              </label>
            );
          })}
        </div>
        {infrastructures.length === 0 && (
          <p className="text-primary-700 text-sm">Nenhum item de infraestrutura cadastrado.</p>
        )}
      </fieldset>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando..." : packageId ? "Salvar alterações" : "Criar pacote"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/pacotes")}
          className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
