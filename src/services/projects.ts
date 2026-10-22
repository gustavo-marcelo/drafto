import "server-only";

import { prisma } from "@/lib/prisma";

export async function listProjects(q?: string) {
  return prisma.project.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { client: { name: { contains: q, mode: "insensitive" } } },
            { client: { clientCode: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
      client: { select: { id: true, name: true, clientCode: true } },
      _count: { select: { documents: true, proposals: true } },
    },
  });
}

export async function listProjectOptions() {
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      clientId: true,
      client: { select: { name: true } },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    clientId: project.clientId,
    clientName: project.client.name,
  }));
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, clientCode: true } },
      documents: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, updatedAt: true },
      },
      proposals: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function getProjectDocument(projectId: string, documentId: string) {
  return prisma.projectDocument.findFirst({
    where: { id: documentId, projectId },
  });
}

export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>[number];
export type ProjectOption = Awaited<ReturnType<typeof listProjectOptions>>[number];
export type ProjectFull = NonNullable<Awaited<ReturnType<typeof getProjectById>>>;
