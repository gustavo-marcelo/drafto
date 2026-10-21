"use client";

import { useState, useTransition } from "react";

import { saveSettings } from "@/app/actions/settings";
import { Field, inputClass } from "@/components/ui/field";
import { formatCnpj, formatPhone } from "@/lib/format";
import type { Settings } from "@/services/settings";
import { type SettingsData, settingsSchema } from "@/lib/validations/settings";

type SettingsFormProps = {
  initial: Settings;
};

const PLACEHOLDER_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="8" fill="#123b36"/><text x="48" y="60" font-family="Arial" font-size="40" fill="#c7a66b" text-anchor="middle">P</text></svg>',
  );

const MAX_LOGO_DIMENSION = 512;
const MAX_LOGO_PNG_CHARS = 1_400_000;
const MAX_LOGO_CHARS = 1_800_000;

export function SettingsForm({ initial }: SettingsFormProps) {
  const [data, setData] = useState<SettingsData>({
    companyName: initial.companyName,
    tagline: initial.tagline,
    responsible: initial.responsible,
    responsibleRole: initial.responsibleRole,
    cnpj: initial.cnpj,
    phone: initial.phone,
    email: initial.email,
    logo: initial.logo,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });
  }

  async function prepareLogo(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) throw new Error("type");
    if (file.size > 10_000_000) throw new Error("source-size");
    if (file.type === "image/svg+xml") {
      const url = await readAsDataURL(file);
      if (url.length > MAX_LOGO_CHARS) throw new Error("output-size");
      return url;
    }
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let out = canvas.toDataURL("image/png");
      if (out.length > MAX_LOGO_PNG_CHARS) out = canvas.toDataURL("image/jpeg", 0.85);
      if (out.length > MAX_LOGO_CHARS) throw new Error("output-size");
      return out;
    } finally {
      bitmap.close();
    }
  }

  async function handleLogoFile(file: File | undefined) {
    if (!file) return;
    try {
      const url = await prepareLogo(file);
      setErrors({});
      update("logo", url);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      const message =
        code === "type" || code === "source-size"
          ? "Selecione um arquivo de imagem (PNG, JPG ou SVG, até 10MB)."
          : "Não foi possível processar esta imagem. Tente outro arquivo (PNG, JPG ou SVG).";
      setErrors({ logo: [message] });
    }
  }

  function submit() {
    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setMessage("Corrija os campos destacados.");
      return;
    }
    setErrors({});
    startTransition(async () => {
      try {
        const result = await saveSettings(parsed.data);
        if (result.ok) {
          setMessage("Configurações salvas.");
        } else {
          setErrors(result.errors ?? {});
          setMessage(result.message ?? "Corrija os campos destacados.");
        }
      } catch {
        setErrors({});
        setMessage("Falha ao salvar as configurações. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-primary-100 flex flex-col gap-4 rounded-lg border bg-white p-6">
        <h2 className="text-primary-900 text-lg font-semibold">Identidade da empresa</h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-2">
            <span className="text-primary-800 text-sm font-medium">Logo</span>
            <label
              htmlFor="logo"
              title="Clique para escolher outra logo"
              className="group w-fit cursor-pointer"
            >
              <img
                src={data.logo ?? PLACEHOLDER_LOGO}
                alt="Logo da empresa"
                className="border-primary-200 h-24 w-24 rounded-md border object-contain transition-opacity group-hover:opacity-75"
              />
            </label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void handleLogoFile(file);
              }}
              className="text-primary-700 text-sm"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update("logo", null)}
                className="text-primary-600 hover:text-primary-900 text-sm underline"
              >
                Remover logo
              </button>
            </div>
            {errors.logo && <p className="text-sm text-red-600">{errors.logo.join(" ")}</p>}
            <p className="text-primary-500 text-xs">
              PNG, JPG ou SVG — a imagem é redimensionada automaticamente.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <Field label="Empresa prestadora" name="companyName" errors={errors.companyName}>
              <input
                id="companyName"
                type="text"
                value={data.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Ex: Destrava Tecnologia Ltda"
                className={inputClass}
              />
            </Field>

            <Field label="Frase da empresa" name="tagline" errors={errors.tagline}>
              <input
                id="tagline"
                type="text"
                value={data.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Ex: Credenciamento e Gestão de Eventos"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="border-primary-100 flex flex-col gap-4 rounded-lg border bg-white p-6">
        <h2 className="text-primary-900 text-lg font-semibold">Responsável e contato</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Responsável" name="responsible" errors={errors.responsible}>
            <input
              id="responsible"
              type="text"
              value={data.responsible}
              onChange={(e) => update("responsible", e.target.value)}
              placeholder="Ex: Ana Souza"
              className={inputClass}
            />
          </Field>

          <Field label="Cargo" name="responsibleRole" errors={errors.responsibleRole}>
            <input
              id="responsibleRole"
              type="text"
              value={data.responsibleRole}
              onChange={(e) => update("responsibleRole", e.target.value)}
              placeholder="Ex: Diretora Comercial"
              className={inputClass}
            />
          </Field>

          <Field label="CNPJ da empresa" name="cnpj" errors={errors.cnpj}>
            <input
              id="cnpj"
              type="text"
              inputMode="numeric"
              value={formatCnpj(data.cnpj)}
              onChange={(e) => update("cnpj", formatCnpj(e.target.value))}
              placeholder="Ex: 00.000.000/0001-00"
              className={inputClass}
            />
          </Field>

          <Field label="Telefone" name="phone" errors={errors.phone}>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={formatPhone(data.phone)}
              onChange={(e) => update("phone", formatPhone(e.target.value))}
              placeholder="Ex: (61) 98765-4321"
              className={inputClass}
            />
          </Field>

          <Field label="E-mail" name="email" errors={errors.email}>
            <input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Ex: contato@empresa.com.br"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${errors && Object.keys(errors).length > 0 ? "text-red-600" : "text-primary-700"}`}
        >
          {message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
