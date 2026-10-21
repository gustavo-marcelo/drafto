"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/auth";
import { captureServerError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { createUserSchema, type UserActionResult, updateUserSchema } from "@/lib/validations/user";

export async function createUser(input: unknown): Promise<UserActionResult> {
  await verifySession();

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, message: "Já existe uma conta com este e-mail." };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, passwordHash },
      select: { id: true, email: true, name: true, phone: true },
    });

    revalidatePath("/dashboard/usuarios");
    return { ok: true, user };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return { ok: false, message: "Já existe uma conta com este e-mail." };
    }
    await captureServerError(error, "Falha ao criar usuário", { email });
    throw error;
  }
}

export async function updateUser(id: string, input: unknown): Promise<UserActionResult> {
  await verifySession();

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return { ok: false, message: "Usuário não encontrado." };
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (emailTaken) {
    return { ok: false, message: "Já existe uma conta com este e-mail." };
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
      select: { id: true, email: true, name: true, phone: true },
    });

    revalidatePath("/dashboard/usuarios");
    return { ok: true, user };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return { ok: false, message: "Já existe uma conta com este e-mail." };
    }
    await captureServerError(error, "Falha ao atualizar usuário", { id });
    throw error;
  }
}
