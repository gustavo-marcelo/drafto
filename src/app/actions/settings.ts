"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type SettingsActionResult, settingsSchema } from "@/lib/validations/settings";

export async function saveSettings(input: unknown): Promise<SettingsActionResult> {
  await verifySession();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const values = {
    logo: data.logo || null,
    companyName: data.companyName,
    tagline: data.tagline || null,
    responsible: data.responsible || null,
    responsibleRole: data.responsibleRole || null,
    cnpj: data.cnpj || null,
    phone: data.phone || null,
    email: data.email || null,
  };

  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: values,
    create: { id: "singleton", ...values },
  });

  revalidatePath("/", "layout");

  return { ok: true };
}
