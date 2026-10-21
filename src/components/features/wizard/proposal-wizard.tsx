"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { saveProposalFull } from "@/app/actions/wizard";
import { ProposalDocumentAutoLayout } from "@/components/proposal/proposal-document-auto-layout";
import { PROPOSAL_DOCUMENT_CSS } from "@/lib/proposal-document-css";
import { wizardToDocument } from "@/lib/proposal-document-wizard";
import type { ProposalDocumentSettings } from "@/lib/proposal-document";
import type { ClientOption } from "@/lib/validations/client";
import { type WizardData, wizardSchema } from "@/lib/validations/wizard";

import { StepEvento } from "./steps/step-evento";
import { StepModulos } from "./steps/step-modulos";
import { StepFinanceiro } from "./steps/step-financeiro";
import { StepOperacional } from "./steps/step-operacional";

const STEPS = [
  { id: 1, label: "Evento e Cliente" },
  { id: 2, label: "Módulos e Infraestrutura" },
  { id: 3, label: "Valores e Pagamento" },
  { id: 4, label: "Operacional e Revisão" },
];

const STEP_FIELDS: Record<number, string[]> = {
  1: ["title", "subtitle", "eventDate", "issuedAt", "location", "audience", "clientId"],
  2: ["solution", "modules", "infrastructure"],
  3: [
    "packageId",
    "totalAmount",
    "paymentMethod",
    "validUntil",
    "valueItems",
    "includedCosts",
    "payments",
  ],
  4: ["requirements", "disclaimer", "acceptanceNote", "schedule"],
};

function errorsForStep(flat: Record<string, string[]>, step: number): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(flat).filter(([key]) => STEP_FIELDS[step].includes(key)),
  );
}

export type { ClientOption };
export type PackageOption = { id: string; name: string; payload?: unknown };
export type ResourceOption = {
  id: string;
  key: string;
  title: string;
  description?: string | null;
};
export type InfrastructureOption = {
  id: string;
  key: string;
  title: string;
  description?: string | null;
};

const EMPTY: WizardData = {
  title: "",
  subtitle: "",
  eventDate: "",
  issuedAt: "",
  location: "",
  audience: "",
  clientId: "",
  solution: "",
  modules: [],
  infrastructure: [],
  packageId: "",
  totalAmount: undefined,
  paymentMethod: "",
  validUntil: "",
  includedCosts: "",
  valueItems: [],
  payments: [],
  requirements: "",
  disclaimer: "",
  acceptanceNote: "",
  schedule: [],
};

const DEFAULT_SCHEDULE: WizardData["schedule"] = [
  {
    date: "",
    title: "Montagem e preparação",
    description: "Instalação, configuração e testes da infraestrutura e da operação.",
  },
  {
    date: "",
    title: "Operação do evento",
    description: "Credenciamento, autoatendimento, impressão e suporte técnico presencial.",
  },
  {
    date: "Após encerramento",
    title: "Desmontagem e consolidação",
    description: "Retirada da infraestrutura e disponibilização da base consolidada.",
  },
];

type WizardProps = {
  clients: ClientOption[];
  packages: PackageOption[];
  resources: ResourceOption[];
  infrastructures: InfrastructureOption[];
  initialData?: Partial<WizardData>;
  proposalId?: string;
  settings?: ProposalDocumentSettings;
};

export function ProposalWizard({
  clients,
  packages,
  resources,
  infrastructures,
  initialData,
  proposalId,
  settings = {},
}: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(() => ({
    ...EMPTY,
    issuedAt: new Date().toISOString().slice(0, 10),
    ...initialData,
    schedule: initialData?.schedule ?? DEFAULT_SCHEDULE,
  }));
  const [clientList, setClientList] = useState<ClientOption[]>(clients);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(3);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleModule(key: string) {
    setData((prev) => {
      const exists = prev.modules.some((m) => m.key === key);
      if (exists) {
        return { ...prev, modules: prev.modules.filter((m) => m.key !== key) };
      }
      const catalog = resources.find((m) => m.key === key);
      if (!catalog) return prev;
      return {
        ...prev,
        modules: [
          ...prev.modules,
          { key: catalog.key, title: catalog.title, description: catalog.description ?? "" },
        ],
      };
    });
  }

  function toggleInfrastructure(key: string) {
    setData((prev) => {
      const exists = prev.infrastructure.some((item) => item.key === key);
      if (exists) {
        return {
          ...prev,
          infrastructure: prev.infrastructure.filter((item) => item.key !== key),
        };
      }
      const catalog = infrastructures.find((item) => item.key === key);
      if (!catalog) return prev;
      return {
        ...prev,
        infrastructure: [
          ...prev.infrastructure,
          { key: catalog.key, title: catalog.title, description: catalog.description ?? "" },
        ],
      };
    });
  }

  function validateStep(current: number): boolean {
    const result = wizardSchema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }
    const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
    const stepErrors = errorsForStep(flat, current);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goToStep(target: number) {
    if (target === step) return;
    const result = wizardSchema.safeParse(data);
    if (result.success) {
      setErrors({});
      setMessage(null);
      setStep(target);
      return;
    }
    const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
    for (let s = 1; s < target; s++) {
      const stepErrors = errorsForStep(flat, s);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setMessage("Corrija os campos destacados para avançar.");
        setStep(s);
        return;
      }
    }
    setErrors(errorsForStep(flat, target));
    setMessage(null);
    setStep(target);
  }

  function next() {
    if (!validateStep(step)) return;
    setMessage(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setErrors({});
    setMessage(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  function submit() {
    if (!validateStep(4)) return;
    startTransition(async () => {
      const result = await saveProposalFull(data, proposalId);
      if (result.ok) {
        toast.success(proposalId ? "Proposta salva." : "Proposta criada.");
        router.push(`/dashboard/propostas/${result.proposalId}`);
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        const message = result.message ?? "Corrija os campos destacados.";
        setMessage(message);
        toast.error(message);
      }
    });
  }

  const selectedClient = clientList.find((c) => c.id === data.clientId) ?? null;
  const previewDocument = wizardToDocument(data, selectedClient, settings);

  return (
    <div className="flex flex-col gap-6">
      <style dangerouslySetInnerHTML={{ __html: PROPOSAL_DOCUMENT_CSS }} />

      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((item, index) => {
          const active = item.id === step;
          const done = item.id < step;
          return (
            <li key={item.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToStep(item.id)}
                aria-current={active ? "step" : undefined}
                title={`Ir para a etapa ${item.id}`}
                className="hover:bg-primary-50 flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    active
                      ? "bg-primary-600 text-white"
                      : done
                        ? "bg-accent-500 text-primary-950"
                        : "bg-primary-100 text-primary-700"
                  }`}
                >
                  {item.id}
                </span>
                <span
                  className={`text-sm ${active ? "text-primary-900 font-medium" : "text-primary-600"}`}
                >
                  {item.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <span className="text-primary-300 mx-1" aria-hidden="true">
                  —
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="flex flex-col gap-6">
          <div className="border-primary-100 rounded-lg border bg-white p-6">
            {step === 1 && (
              <StepEvento
                data={data}
                errors={errors}
                clients={clientList}
                onChange={update}
                onClientCreated={(client) => {
                  setClientList((prev) => [...prev, client]);
                  update("clientId", client.id);
                }}
              />
            )}
            {step === 2 && (
              <StepModulos
                data={data}
                errors={errors}
                packages={packages}
                resources={resources}
                infrastructures={infrastructures}
                onChange={update}
                onToggleModule={toggleModule}
                onToggleInfrastructure={toggleInfrastructure}
              />
            )}
            {step === 3 && <StepFinanceiro data={data} errors={errors} onChange={update} />}
            {step === 4 && (
              <StepOperacional data={data} errors={errors} clients={clients} onChange={update} />
            )}
          </div>

          {message && <p className="text-sm text-red-600">{message}</p>}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 1 || pending}
              className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors disabled:opacity-40"
            >
              Voltar
            </button>
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={next}
                className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
              >
                {pending ? "Salvando..." : proposalId ? "Salvar alterações" : "Criar proposta"}
              </button>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="border-primary-100 sticky top-6 overflow-hidden rounded-lg border bg-white">
            <div className="border-primary-100 bg-primary-50/60 flex items-center justify-between border-b px-4 py-3">
              <span className="text-primary-900 text-sm font-semibold">Pré-visualização</span>
              <span className="text-primary-700 text-xs">{pageCount} páginas · A4</span>
            </div>
            <div className="doc-preview-scroll">
              <div
                className="doc-preview-frame"
                style={{
                  height: `calc((297mm * ${pageCount} + 8mm * ${Math.max(pageCount - 1, 0)}) * 0.42)`,
                }}
              >
                <div className="doc-preview-scale">
                  <ProposalDocumentAutoLayout
                    document={previewDocument}
                    onPageCountChange={setPageCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
