"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { type ResourceActionResult, resourceSchema } from "@/lib/validations/resource";

async function uniqueKey(base: string, ignoreId?: string): Promise<string> {
  const slug = slugify(base) || "recurso";
  let candidate = slug;
  let suffix = 1;

  for (;;) {
    const existing = await prisma.resource.findUnique({ where: { key: candidate } });
    if (!existing || existing.id === ignoreId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }
}

export async function saveResource(
  input: unknown,
  resourceId?: string,
): Promise<ResourceActionResult> {
  await verifySession();

  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const key = await uniqueKey(data.title, resourceId);

  const base = {
    key,
    title: data.title,
    description: data.description || null,
    position: data.position,
    active: data.active,
  };

  const stored = resourceId
    ? await prisma.resource.update({ where: { id: resourceId }, data: base, select: { id: true } })
    : await prisma.resource.create({ data: base, select: { id: true } });

  revalidatePath("/dashboard/recursos");
  return { ok: true, resourceId: stored.id };
}

export async function deleteResource(id: string): Promise<void> {
  await verifySession();
  await prisma.resource.delete({ where: { id } });
  revalidatePath("/dashboard/recursos");
  redirect("/dashboard/recursos");
}
