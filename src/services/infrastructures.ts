import "server-only";

import { prisma } from "@/lib/prisma";

export async function listInfrastructures() {
  return prisma.infrastructure.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { title: "asc" }],
    select: { id: true, key: true, title: true, description: true },
  });
}

export async function listAllInfrastructures() {
  return prisma.infrastructure.findMany({
    orderBy: [{ position: "asc" }, { title: "asc" }],
  });
}

export async function getInfrastructureById(id: string) {
  return prisma.infrastructure.findUnique({ where: { id } });
}

export type InfrastructureOption = Awaited<ReturnType<typeof listInfrastructures>>[number];
