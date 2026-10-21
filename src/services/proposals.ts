import "server-only";

import type { Prisma, ProposalStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ProposalListItem = {
  id: string;
  code: string | null;
  title: string;
  status: ProposalStatus;
  eventDate: Date | null;
  clientName: string | null;
  totalAmount: string | null;
  updatedAt: Date;
};

export type ProposalFilters = {
  q?: string;
  status?: ProposalStatus;
};

export async function listProposals(filters: ProposalFilters = {}): Promise<ProposalListItem[]> {
  const where: Prisma.ProposalWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { client: { name: { contains: filters.q, mode: "insensitive" } } },
      { client: { clientCode: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  const proposals = await prisma.proposal.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      eventDate: true,
      totalAmount: true,
      updatedAt: true,
      client: { select: { name: true } },
    },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    code: proposal.code,
    title: proposal.title,
    status: proposal.status,
    eventDate: proposal.eventDate,
    totalAmount: proposal.totalAmount?.toString() ?? null,
    updatedAt: proposal.updatedAt,
    clientName: proposal.client?.name ?? null,
  }));
}

export async function getProposalById(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      client: true,
      author: { select: { id: true, name: true, email: true } },
      modules: true,
      infrastructure: true,
      payments: { orderBy: { dueDate: "asc" } },
      schedule: { orderBy: { position: "asc" } },
      package: true,
    },
  });
}

export async function getProposalByShareId(shareId: string) {
  return prisma.proposal.findUnique({
    where: { shareId },
    include: {
      client: true,
      modules: true,
      infrastructure: true,
      payments: { orderBy: { dueDate: "asc" } },
      schedule: { orderBy: { position: "asc" } },
    },
  });
}

export type ProposalFull = NonNullable<Awaited<ReturnType<typeof getProposalById>>>;

export async function listClients() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, clientCode: true },
  });
}

export async function listPackages() {
  return prisma.package.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, payload: true },
  });
}
