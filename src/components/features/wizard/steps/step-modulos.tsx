"use client";

import type { InfrastructureOption, PackageOption, ResourceOption } from "../proposal-wizard";
import { TextPresetTextarea } from "@/components/features/text-preset-textarea";
import { Field, inputClass } from "@/components/ui/field";
import { parsePackagePayload } from "@/lib/package-payload";
import type { WizardData } from "@/lib/validations/wizard";

type StepModulosProps = {
  data: WizardData;
  errors: Record<string, string[]>;
  packages: PackageOption[];
  resources: ResourceOption[];
  infrastructures: InfrastructureOption[];
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  onToggleModule: (key: string) => void;
  onToggleInfrastructure: (key: string) => void;
};

export function StepModulos({
  data,
  errors,
  packages,
  resources,
  infrastructures,
  onChange,
  onToggleModule,
  onToggleInfrastructure,
}: StepModulosProps) {
  const resourceByKey = new Map(resources.map((resource) => [resource.key, resource]));
  const resourceByTitle = new Map(resources.map((resource) => [resource.title, resource]));
  const infrastructureByKey = new Map(
    infrastructures.map((infrastructure) => [infrastructure.key, infrastructure]),
  );
  const infrastructureByTitle = new Map(
    infrastructures.map((infrastructure) => [infrastructure.title, infrastructure]),
  );

  function selectPackage(packageId: string) {
    onChange("packageId", packageId);
    if (!packageId) return;

    const pkg = packages.find((p) => p.id === packageId);
    const payload = parsePackagePayload(pkg?.payload);
    if (!payload.recursos?.length && !payload.infraestrutura?.length) return;

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

    if (payload.infraestrutura?.length) {
      const items = payload.infraestrutura.map((entry) => {
        const catalog = infrastructureByKey.get(entry) ?? infrastructureByTitle.get(entry);
        return {
          key: catalog?.key ?? entry,
          title: catalog?.title ?? entry,
          description: catalog?.description ?? "",
        };
      });
      onChange("infrastructure", items);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary-900 text-lg font-semibold">
        Serviços, recursos e infraestrutura
      </h2>

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
          O pacote pré-preenche recursos e infraestrutura; ajuste após aplicar.
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

      <fieldset className="flex flex-col gap-2">
        <legend className="text-primary-800 text-sm font-medium">Infraestrutura e operação</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {infrastructures.map((infrastructure) => {
            const checked = data.infrastructure.some((item) => item.key === infrastructure.key);
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
                  onChange={() => onToggleInfrastructure(infrastructure.key)}
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
        {errors.infrastructure && errors.infrastructure.length > 0 && (
          <p className="text-sm text-red-600">{errors.infrastructure.join(" ")}</p>
        )}
      </fieldset>
    </div>
  );
}
