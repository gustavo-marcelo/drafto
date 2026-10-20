"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { createSession, deleteSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type AuthFormState, loginSchema } from "@/lib/validations/auth";

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { message: "E-mail ou senha inválidos." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { message: "E-mail ou senha inválidos." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
