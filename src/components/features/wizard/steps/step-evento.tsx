"use client";

import { useState, useTransition } from "react";

import type { ClientOption } from "../proposal-wizard";
import { saveClient } from "@/app/actions/clients";
import { ClientFields } from "@/components/features/client-fields";
import { Field, inputClass } from "@/components/ui/field";
import type { ClientInput } from "@/lib/validations/client";
import type { WizardData } from "@/lib/validations/wizard";

type StepEventoProps = {
  data: WizardData;
  errors: Record<string, string[]>;
  clients: ClientOption[];
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  onClientCreated: (client: ClientOption) => void;
};

const EMPTY_CLIENT: ClientInput = {
  name: "",
  address: "",
  document: "",
  contact: "",
  phone: "",
  email: "",
  clientCode: "",
};

function NewClientForm({ onCreated }: { onCreated: (client: ClientOption) => void }) {
  const [form, setForm] = useState<ClientInput>(EMPTY_CLIENT);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveClient(form);
      if (result.ok) {
        setForm(EMPTY_CLIENT);
        setErrors({});
        onCreated(result.client);
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos do cliente.");
      }
    });
  }

  return (
    <div className="border-primary-200 bg-primary-50/60 flex flex-col gap-4 rounded-md border p-4">
      <ClientFields form={form} errors={errors} onChange={update} />

      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-3 py-1.5 text-sm transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar cliente"}
        </button>
      </div>
    </div>
  );
}

export function StepEvento({ data, errors, clients, onChange, onClientCreated }: StepEventoProps) {
  const [showNewClient, setShowNewClient] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary-900 text-lg font-semibold">Evento e Cliente</h2>

      <Field label="Título da proposta / evento" name="title" errors={errors.title}>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Ex: Evento Lançamento"
          className={inputClass}
        />
      </Field>

      <Field label="Subtítulo / descrição resumida" name="subtitle" errors={errors.subtitle}>
        <input
          id="subtitle"
          type="text"
          value={data.subtitle}
          onChange={(e) => onChange("subtitle", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Data do evento" name="eventDate" errors={errors.eventDate}>
          <input
            id="eventDate"
            type="date"
            value={data.eventDate}
            onChange={(e) => onChange("eventDate", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Data de emissão" name="issuedAt" errors={errors.issuedAt}>
          <input
            id="issuedAt"
            type="date"
            value={data.issuedAt}
            onChange={(e) => onChange("issuedAt", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Local do evento" name="location" errors={errors.location}>
          <input
            id="location"
            type="text"
            value={data.location}
            onChange={(e) => onChange("location", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Público estimado" name="audience" errors={errors.audience}>
          <input
            id="audience"
            type="text"
            value={data.audience}
            onChange={(e) => onChange("audience", e.target.value)}
            placeholder="Ex: 500 pessoas"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="Contratante" name="clientId" errors={errors.clientId}>
            <select
              id="clientId"
              value={data.clientId}
              onChange={(e) => onChange("clientId", e.target.value)}
              className={inputClass}
            >
              <option value="">— Selecione —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.clientCode ? ` (${client.clientCode})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={() => setShowNewClient((open) => !open)}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-2 text-sm transition-colors"
          >
            {showNewClient ? "Cancelar novo cliente" : "+ Novo cliente"}
          </button>
        </div>

        {showNewClient && (
          <NewClientForm
            onCreated={(client) => {
              onClientCreated(client);
              setShowNewClient(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
