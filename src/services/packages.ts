import "server-only";

import { prisma } from "@/lib/prisma";

export async function listPackagesFull() {
  return prisma.package.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, audience: true, payload: true },
  });
}

export async function getPackageById(id: string) {
  return prisma.package.findUnique({ where: { id } });
}

export type PackageFull = NonNullable<Awaited<ReturnType<typeof getPackageById>>>;
