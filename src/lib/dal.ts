import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { decrypt } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export const getCurrentUser = cache(async (): Promise<SessionUser> => {
  await connection();

  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
});
