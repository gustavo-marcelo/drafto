"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { savePackage } from "@/app/actions/packages";
import { Field, inputClass } from "@/components/ui/field";
import type { PackageData, PackageEquipment } from "@/lib/validations/package";
import type { ResourceOption } from "@/services/resources";

const EMPTY: PackageData = {
  name: "",
  description: "",
  audience: "",
  recursos: [],
  equipamentos: [],
};

type PackageFormProps = {
  resources: ResourceOption[];
  initialData?: Partial<PackageData>;
  packageId?: string;
};

export function PackageForm({ resources, initialData, packageId }: PackageFormProps) {
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

  function addEquipment() {
    update("equipamentos", [
      ...data.equipamentos,
      { name: "", description: "", quantity: 1, specs: "" },
    ]);
  }

  function updateEquipment(index: number, item: PackageEquipment) {
    update(
      "equipamentos",
      data.equipamentos.map((current, i) => (i === index ? item : current)),
    );
  }

  function removeEquipment(index: number) {
    update(
      "equipamentos",
      data.equipamentos.filter((_, i) => i !== index),
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-primary-800 text-sm font-medium">Equipamentos</h3>
          <button
            type="button"
            onClick={addEquipment}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            + Adicionar equipamento
          </button>
        </div>
        {data.equipamentos.length === 0 && (
          <p className="text-primary-700 text-sm">Nenhum equipamento adicionado.</p>
        )}
        {data.equipamentos.map((item, index) => (
          <div key={index} className="border-primary-100 flex flex-col gap-3 rounded-md border p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1">
                <label
                  className="text-primary-800 text-sm font-medium"
                  htmlFor={`pkg-eq-${index}-name`}
                >
                  Equipamento
                </label>
                <input
                  id={`pkg-eq-${index}-name`}
                  type="text"
                  value={item.name}
                  onChange={(e) => updateEquipment(index, { ...item, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex w-full flex-col gap-1 sm:w-24">
                <label
                  className="text-primary-800 text-sm font-medium"
                  htmlFor={`pkg-eq-${index}-qty`}
                >
                  Qtd.
                </label>
                <input
                  id={`pkg-eq-${index}-qty`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateEquipment(index, { ...item, quantity: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => removeEquipment(index)}
                className="border-primary-200 rounded-md border px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                Remover
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-primary-800 text-sm font-medium"
                htmlFor={`pkg-eq-${index}-specs`}
              >
                Especificações
              </label>
              <input
                id={`pkg-eq-${index}-specs`}
                type="text"
                value={item.specs}
                onChange={(e) => updateEquipment(index, { ...item, specs: e.target.value })}
                placeholder='Ex: Tela 15,6", Ryzen 5, 16GB RAM'
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>

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
