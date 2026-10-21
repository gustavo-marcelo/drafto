import "server-only";

import { prisma } from "@/lib/prisma";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      _count: { select: { proposals: true } },
    },
  });
}

export type UserListItem = Awaited<ReturnType<typeof listUsers>>[number];
