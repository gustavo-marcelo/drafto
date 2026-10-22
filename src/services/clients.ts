import "server-only";

import { prisma } from "@/lib/prisma";

export async function listClients(q?: string) {
  return prisma.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { document: { contains: q, mode: "insensitive" } },
            { clientCode: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { zipCode: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      zipCode: true,
      street: true,
      number: true,
      complement: true,
      city: true,
      state: true,
      document: true,
      contact: true,
      phone: true,
      email: true,
      clientCode: true,
      _count: { select: { proposals: true, projects: true } },
    },
  });
}

export async function listClientOptions() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, clientCode: true },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export type ClientListItem = Awaited<ReturnType<typeof listClients>>[number];
