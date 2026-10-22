"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveProject } from "@/app/actions/projects";
import { Field, inputClass } from "@/components/ui/field";
import type { ProjectInput } from "@/lib/validations/project";

const EMPTY: ProjectInput = {
  name: "",
  description: "",
  clientId: "",
};

type ProjectFormProps = {
  clients: { id: string; name: string; clientCode: string | null }[];
  initialData?: Partial<ProjectInput>;
  projectId?: string;
};

export function ProjectForm({ clients, initialData, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectInput>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProject(form, projectId);
      if (result.ok) {
        if (!projectId) {
          setForm(EMPTY);
          setErrors({});
          setMessage(null);
        }
        router.push(`/dashboard/projetos/${result.projectId}`);
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos destacados.");
      }
    });
  }

  return (
    <div className="border-primary-100 flex max-w-3xl flex-col gap-4 rounded-lg border bg-white p-6">
      <Field label="Nome do projeto" name="name" errors={errors.name}>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Ex: Credenciamento do evento de lançamento"
          className={inputClass}
        />
      </Field>

      <Field label="Cliente" name="clientId" errors={errors.clientId}>
        <select
          id="clientId"
          value={form.clientId}
          onChange={(e) => update("clientId", e.target.value)}
          className={inputClass}
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.clientCode ? ` — ${client.clientCode}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Breve descrição" name="description" errors={errors.description}>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Resuma o objetivo e o escopo do projeto."
          className={inputClass}
        />
      </Field>

      {clients.length === 0 && (
        <p className="text-primary-700 text-sm">
          Nenhum cliente cadastrado. Cadastre um cliente antes de criar o projeto.
        </p>
      )}

      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || clients.length === 0}
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando..." : projectId ? "Salvar alterações" : "Criar projeto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/projetos")}
          className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
