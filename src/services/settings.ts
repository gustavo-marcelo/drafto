import "server-only";

import { prisma } from "@/lib/prisma";

export type Settings = {
  logo: string | null;
  companyName: string;
  tagline: string;
  responsible: string;
  responsibleRole: string;
  cnpj: string;
  phone: string;
  email: string;
};

const DEFAULT_SETTINGS: Settings = {
  logo: null,
  companyName: "Proposta.ai",
  tagline: "Credenciamento e Gestão de Eventos",
  responsible: "",
  responsibleRole: "",
  cnpj: "",
  phone: "",
  email: "",
};

export async function getSettings(): Promise<Settings> {
  const row = await prisma.setting.findUnique({ where: { id: "singleton" } });

  if (!row) {
    return DEFAULT_SETTINGS;
  }

  return {
    logo: row.logo,
    companyName: row.companyName || DEFAULT_SETTINGS.companyName,
    tagline: row.tagline || DEFAULT_SETTINGS.tagline,
    responsible: row.responsible || "",
    responsibleRole: row.responsibleRole || "",
    cnpj: row.cnpj || "",
    phone: row.phone || "",
    email: row.email || "",
  };
}
