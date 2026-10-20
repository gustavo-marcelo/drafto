"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type PackageActionResult, packageSchema } from "@/lib/validations/package";

export async function savePackage(
  input: unknown,
  packageId?: string,
): Promise<PackageActionResult> {
  await verifySession();

  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const payload = {
    recursos: data.recursos,
    equipamentos: data.equipamentos.map((item) => ({
      name: item.name,
      description: item.description || undefined,
      quantity: item.quantity,
      specs: item.specs || undefined,
    })),
  };

  const base = {
    name: data.name,
    description: data.description || null,
    audience: data.audience || null,
    payload,
  };

  const stored = packageId
    ? await prisma.package.update({ where: { id: packageId }, data: base, select: { id: true } })
    : await prisma.package.create({ data: base, select: { id: true } });

  revalidatePath("/dashboard/pacotes");
  return { ok: true, packageId: stored.id };
}

export async function deletePackage(id: string): Promise<void> {
  await verifySession();
  await prisma.package.delete({ where: { id } });
  revalidatePath("/dashboard/pacotes");
  redirect("/dashboard/pacotes");
}
