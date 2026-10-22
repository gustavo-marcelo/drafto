"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { captureServerError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import {
  type ProjectActionResult,
  type ProjectDocumentActionResult,
  projectDocumentSchema,
  projectSchema,
} from "@/lib/validations/project";

export async function saveProject(
  input: unknown,
  projectId?: string,
): Promise<ProjectActionResult> {
  await verifySession();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
    select: { id: true },
  });

  if (!client) {
    return { ok: false, message: "Cliente não encontrado." };
  }

  try {
    const project = projectId
      ? await prisma.project.update({
          where: { id: projectId },
          data: {
            name: data.name,
            description: data.description,
            clientId: data.clientId,
          },
          select: { id: true },
        })
      : await prisma.project.create({
          data: {
            name: data.name,
            description: data.description,
            clientId: data.clientId,
          },
          select: { id: true },
        });

    revalidatePath("/dashboard/projetos");
    revalidatePath(`/dashboard/projetos/${project.id}`);
    revalidatePath("/dashboard");
    return { ok: true, projectId: project.id };
  } catch (error) {
    await captureServerError(error, "Falha ao salvar projeto", {
      projectId,
      clientId: data.clientId,
    });
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  await verifySession();

  await prisma.project.delete({ where: { id } });
  revalidatePath("/dashboard/projetos");
  revalidatePath("/dashboard");
  redirect("/dashboard/projetos");
}

export async function saveProjectDocument(
  projectId: string,
  input: unknown,
  documentId?: string,
): Promise<ProjectDocumentActionResult> {
  await verifySession();

  const parsed = projectDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    return { ok: false, message: "Projeto não encontrado." };
  }

  if (documentId) {
    const existing = await prisma.projectDocument.findFirst({
      where: { id: documentId, projectId },
      select: { id: true },
    });

    if (!existing) {
      return { ok: false, message: "Documento não encontrado." };
    }
  }

  try {
    const document = documentId
      ? await prisma.projectDocument.update({
          where: { id: documentId },
          data: { title: parsed.data.title, content: parsed.data.content },
          select: { id: true },
        })
      : await prisma.projectDocument.create({
          data: {
            title: parsed.data.title,
            content: parsed.data.content,
            projectId,
          },
          select: { id: true },
        });

    revalidatePath("/dashboard/projetos");
    revalidatePath(`/dashboard/projetos/${projectId}`);
    return { ok: true, documentId: document.id };
  } catch (error) {
    await captureServerError(error, "Falha ao salvar documento do projeto", {
      projectId,
      documentId,
    });
    throw error;
  }
}

export async function deleteProjectDocument(projectId: string, documentId: string): Promise<void> {
  await verifySession();

  await prisma.projectDocument.deleteMany({ where: { id: documentId, projectId } });
  revalidatePath("/dashboard/projetos");
  revalidatePath(`/dashboard/projetos/${projectId}`);
  redirect(`/dashboard/projetos/${projectId}`);
}
