"use client";

import type { ClientOption } from "../proposal-wizard";
import { TextPresetTextarea } from "@/components/features/text-preset-textarea";
import { inputClass } from "@/components/ui/field";
import { formatCurrency, formatDate } from "@/lib/format";
import type { WizardData, WizardSchedule } from "@/lib/validations/wizard";

type StepOperacionalProps = {
  data: WizardData;
  errors: Record<string, string[]>;
  clients: ClientOption[];
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-primary-700 text-xs font-medium tracking-wide uppercase">{label}</span>
      <span className="text-primary-900 text-sm">{value || "—"}</span>
    </div>
  );
}

export function StepOperacional({ data, errors, clients, onChange }: StepOperacionalProps) {
  const client = clients.find((c) => c.id === data.clientId);

  function updateSchedule(index: number, patch: Partial<WizardSchedule>) {
    onChange(
      "schedule",
      data.schedule.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addSchedule() {
    onChange("schedule", [...data.schedule, { date: "", title: "", description: "" }]);
  }

  function removeSchedule(index: number) {
    onChange(
      "schedule",
      data.schedule.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary-900 text-lg font-semibold">Operacional e Revisão</h2>

      <TextPresetTextarea
        category="requirements"
        label="Requisitos pré-evento"
        name="requirements"
        rows={3}
        value={data.requirements}
        onChange={(value) => onChange("requirements", value)}
        placeholder="Ex: Internet mínima, envio de bases de dados, energia elétrica"
        errors={errors.requirements}
      />

      <TextPresetTextarea
        category="disclaimer"
        label="Compromissos e avisos contratuais"
        name="disclaimer"
        rows={3}
        value={data.disclaimer}
        onChange={(value) => onChange("disclaimer", value)}
        errors={errors.disclaimer}
      />

      <TextPresetTextarea
        category="acceptanceNote"
        label="Texto de aceite do contratante"
        name="acceptanceNote"
        rows={2}
        value={data.acceptanceNote}
        onChange={(value) => onChange("acceptanceNote", value)}
        placeholder="Ex: Declaro estar de acordo com os termos acima."
        errors={errors.acceptanceNote}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-primary-800 text-sm font-medium">Cronograma Operacional</h3>
          <button
            type="button"
            onClick={addSchedule}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            + Adicionar etapa
          </button>
        </div>

        {errors.schedule && errors.schedule.length > 0 && (
          <p className="text-sm text-red-600">{errors.schedule.join(" ")}</p>
        )}

        {data.schedule.length === 0 ? (
          <p className="text-primary-700 text-sm">
            Nenhuma etapa adicionada. Ex: Montagem, Operação do evento, Desmontagem.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.schedule.map((item, index) => (
              <div
                key={index}
                className="border-primary-100 grid gap-3 rounded-md border p-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
              >
                <div className="flex flex-col gap-1">
                  <label
                    className="text-primary-800 text-sm font-medium"
                    htmlFor={`schedule-${index}-date`}
                  >
                    Data / Período
                  </label>
                  <input
                    id={`schedule-${index}-date`}
                    type="text"
                    value={item.date}
                    onChange={(e) => updateSchedule(index, { date: e.target.value })}
                    placeholder="Ex: 17/11/2026 ou Após encerramento"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="text-primary-800 text-sm font-medium"
                    htmlFor={`schedule-${index}-title`}
                  >
                    Etapa
                  </label>
                  <input
                    id={`schedule-${index}-title`}
                    type="text"
                    value={item.title}
                    onChange={(e) => updateSchedule(index, { title: e.target.value })}
                    placeholder="Ex: Montagem e preparação"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSchedule(index)}
                  className="border-primary-200 rounded-md border px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 sm:self-end"
                >
                  Remover
                </button>
                <div className="flex flex-col gap-1 sm:col-span-3">
                  <label
                    className="text-primary-800 text-sm font-medium"
                    htmlFor={`schedule-${index}-description`}
                  >
                    Descrição
                  </label>
                  <input
                    id={`schedule-${index}-description`}
                    type="text"
                    value={item.description}
                    onChange={(e) => updateSchedule(index, { description: e.target.value })}
                    placeholder="Ex: Instalação, configuração e testes dos equipamentos."
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="border-primary-100 bg-primary-50 flex flex-col gap-4 rounded-md border p-4">
        <h3 className="text-primary-900 text-sm font-semibold">Pré-visualização da proposta</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReviewRow label="Título" value={data.title} />
          <ReviewRow label="Cliente" value={client ? client.name : ""} />
          <ReviewRow label="Data do evento" value={formatDate(data.eventDate)} />
          <ReviewRow label="Data de emissão" value={formatDate(data.issuedAt)} />
          <ReviewRow label="Local" value={data.location} />
          <ReviewRow label="Público estimado" value={data.audience} />
          <ReviewRow label="Válida até" value={formatDate(data.validUntil)} />
          <ReviewRow label="Forma de pagamento" value={data.paymentMethod} />
          <ReviewRow label="Valor total" value={formatCurrency(data.totalAmount)} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <ReviewRow
            label="Módulos selecionados"
            value={data.modules.map((m) => m.title).join(", ")}
          />
          <ReviewRow
            label="Equipamentos"
            value={data.equipment.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
          />
          <ReviewRow
            label="Parcelas"
            value={data.payments
              .map((p) => `${formatDate(p.dueDate)} — ${formatCurrency(p.amount)}`)
              .join(" | ")}
          />
          <ReviewRow
            label="Cronograma operacional"
            value={data.schedule.map((s) => `${s.date} — ${s.title}`).join(" | ")}
          />
        </div>
      </section>
    </div>
  );
}
