import "server-only";

import { prisma } from "@/lib/prisma";

export async function listResources() {
  return prisma.resource.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { title: "asc" }],
    select: { id: true, key: true, title: true, description: true },
  });
}

export async function listAllResources() {
  return prisma.resource.findMany({
    orderBy: [{ position: "asc" }, { title: "asc" }],
  });
}

export async function getResourceById(id: string) {
  return prisma.resource.findUnique({ where: { id } });
}

export type ResourceOption = Awaited<ReturnType<typeof listResources>>[number];
