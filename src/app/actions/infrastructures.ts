"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import {
  type InfrastructureActionResult,
  infrastructureSchema,
} from "@/lib/validations/infrastructure";

async function uniqueKey(base: string, ignoreId?: string): Promise<string> {
  const slug = slugify(base) || "infraestrutura";
  let candidate = slug;
  let suffix = 1;

  for (;;) {
    const existing = await prisma.infrastructure.findUnique({ where: { key: candidate } });
    if (!existing || existing.id === ignoreId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }
}

export async function saveInfrastructure(
  input: unknown,
  infrastructureId?: string,
): Promise<InfrastructureActionResult> {
  await verifySession();

  const parsed = infrastructureSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const key = await uniqueKey(data.title, infrastructureId);

  const base = {
    key,
    title: data.title,
    description: data.description || null,
    position: data.position,
    active: data.active,
  };

  const stored = infrastructureId
    ? await prisma.infrastructure.update({
        where: { id: infrastructureId },
        data: base,
        select: { id: true },
      })
    : await prisma.infrastructure.create({ data: base, select: { id: true } });

  revalidatePath("/dashboard/infraestrutura");
  return { ok: true, infrastructureId: stored.id };
}

export async function deleteInfrastructure(id: string): Promise<void> {
  await verifySession();
  await prisma.infrastructure.delete({ where: { id } });
  revalidatePath("/dashboard/infraestrutura");
  redirect("/dashboard/infraestrutura");
}
