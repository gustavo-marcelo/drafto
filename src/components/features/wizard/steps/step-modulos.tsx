"use client";

import type { PackageOption, ResourceOption } from "../proposal-wizard";
import { TextPresetTextarea } from "@/components/features/text-preset-textarea";
import { Field, inputClass } from "@/components/ui/field";
import { parsePackagePayload } from "@/lib/package-payload";
import type { WizardData, WizardEquipment } from "@/lib/validations/wizard";

type StepModulosProps = {
  data: WizardData;
  errors: Record<string, string[]>;
  packages: PackageOption[];
  resources: ResourceOption[];
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  onToggleModule: (key: string) => void;
};

function EquipmentRow({
  item,
  index,
  errors,
  onChange,
  onRemove,
}: {
  item: WizardEquipment;
  index: number;
  errors?: string[];
  onChange: (item: WizardEquipment) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border-primary-100 flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label
            className="text-primary-800 text-sm font-medium"
            htmlFor={`equipment-${index}-name`}
          >
            Equipamento
          </label>
          <input
            id={`equipment-${index}-name`}
            type="text"
            value={item.name}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
            placeholder="Ex: Totem de autoatendimento"
            className={inputClass}
          />
        </div>
        <div className="flex w-full flex-col gap-1 sm:w-24">
          <label
            className="text-primary-800 text-sm font-medium"
            htmlFor={`equipment-${index}-quantity`}
          >
            Qtd.
          </label>
          <input
            id={`equipment-${index}-quantity`}
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onChange({ ...item, quantity: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="border-primary-200 rounded-md border px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          Remover
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            className="text-primary-800 text-sm font-medium"
            htmlFor={`equipment-${index}-description`}
          >
            Descrição
          </label>
          <input
            id={`equipment-${index}-description`}
            type="text"
            value={item.description}
            onChange={(e) => onChange({ ...item, description: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-primary-800 text-sm font-medium"
            htmlFor={`equipment-${index}-specs`}
          >
            Especificações
          </label>
          <input
            id={`equipment-${index}-specs`}
            type="text"
            value={item.specs}
            onChange={(e) => onChange({ ...item, specs: e.target.value })}
            placeholder='Ex: Tela 15,6", Ryzen 5, 16GB RAM'
            className={inputClass}
          />
        </div>
      </div>
      {errors && errors.length > 0 && <p className="text-sm text-red-600">{errors.join(" ")}</p>}
    </div>
  );
}

export function StepModulos({
  data,
  errors,
  packages,
  resources,
  onChange,
  onToggleModule,
}: StepModulosProps) {
  const equipmentErrors = errors.equipment?.[0];

  const resourceByKey = new Map(resources.map((resource) => [resource.key, resource]));
  const resourceByTitle = new Map(resources.map((resource) => [resource.title, resource]));

  function selectPackage(packageId: string) {
    onChange("packageId", packageId);
    if (!packageId) return;

    const pkg = packages.find((p) => p.id === packageId);
    const payload = parsePackagePayload(pkg?.payload);
    if (!payload.recursos?.length && !payload.equipamentos?.length) return;

    if (payload.recursos?.length) {
      const modules = payload.recursos.map((entry) => {
        const catalog = resourceByKey.get(entry) ?? resourceByTitle.get(entry);
        return {
          key: catalog?.key ?? entry,
          title: catalog?.title ?? entry,
          description: catalog?.description ?? "",
        };
      });
      onChange("modules", modules);
    }

    if (payload.equipamentos?.length) {
      onChange(
        "equipment",
        payload.equipamentos.map((item) => ({
          name: item.name,
          description: item.description ?? "",
          quantity: item.quantity ?? 1,
          specs: item.specs ?? "",
        })),
      );
    }
  }

  function addEquipment() {
    onChange("equipment", [
      ...data.equipment,
      { name: "", description: "", quantity: 1, specs: "" },
    ]);
  }

  function updateEquipment(index: number, item: WizardEquipment) {
    onChange(
      "equipment",
      data.equipment.map((current, i) => (i === index ? item : current)),
    );
  }

  function removeEquipment(index: number) {
    onChange(
      "equipment",
      data.equipment.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary-900 text-lg font-semibold">Serviços e Equipamentos</h2>

      <Field label="Pacote padrão" name="packageId">
        <select
          id="packageId"
          value={data.packageId}
          onChange={(e) => selectPackage(e.target.value)}
          className={inputClass}
        >
          <option value="">— Nenhum —</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </select>
        <p className="text-primary-700 text-xs">
          O pacote pré-preenche módulos e equipamentos; ajuste após aplicar.
        </p>
      </Field>

      <TextPresetTextarea
        category="solution"
        label="Descrição da solução proposta"
        name="solution"
        rows={3}
        value={data.solution}
        onChange={(value) => onChange("solution", value)}
        errors={errors.solution}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-primary-800 text-sm font-medium">
          Recursos do sistema de credenciamento
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {resources.map((resource) => {
            const checked = data.modules.some((m) => m.key === resource.key);
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
                  onChange={() => onToggleModule(resource.key)}
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
        {resources.length === 0 && (
          <p className="text-primary-700 text-sm">Nenhum recurso cadastrado.</p>
        )}
        {errors.modules && errors.modules.length > 0 && (
          <p className="text-sm text-red-600">{errors.modules.join(" ")}</p>
        )}
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
        {equipmentErrors && <p className="text-sm text-red-600">{equipmentErrors}</p>}
        {data.equipment.length === 0 && (
          <p className="text-primary-700 text-sm">Nenhum equipamento adicionado.</p>
        )}
        {data.equipment.map((item, index) => (
          <EquipmentRow
            key={index}
            item={item}
            index={index}
            onChange={(updated) => updateEquipment(index, updated)}
            onRemove={() => removeEquipment(index)}
          />
        ))}
      </div>
    </div>
  );
}
