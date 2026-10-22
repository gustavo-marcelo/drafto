"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { formatAddress } from "@/lib/format";
import { captureServerError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { generateUniqueCode } from "@/services/codes";
import { type ClientActionResult, clientSchema } from "@/lib/validations/client";

/** Dados do cliente que aparecem no documento da proposta. */
const CLIENT_DOCUMENT_SELECT = {
  id: true,
  name: true,
  clientCode: true,
  document: true,
  contact: true,
  phone: true,
  email: true,
  zipCode: true,
  street: true,
  number: true,
  complement: true,
  city: true,
  state: true,
} as const;

export async function saveClient(input: unknown, clientId?: string): Promise<ClientActionResult> {
  await verifySession();

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const existing = await prisma.client.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      ...(clientId ? { NOT: { id: clientId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, message: "Já existe um cliente com esse nome." };
  }

  const base = {
    name: data.name,
    zipCode: data.zipCode || null,
    street: data.street || null,
    number: data.number || null,
    complement: data.complement || null,
    city: data.city || null,
    state: data.state || null,
    document: data.document || null,
    contact: data.contact || null,
    phone: data.phone || null,
    email: data.email || null,
    clientCode: data.clientCode || (await generateUniqueCode("CL")),
  };

  try {
    const client = clientId
      ? await prisma.client.update({
          where: { id: clientId },
          data: base,
          select: CLIENT_DOCUMENT_SELECT,
        })
      : await prisma.client.create({
          data: base,
          select: CLIENT_DOCUMENT_SELECT,
        });

    revalidatePath("/dashboard/clientes");
    return {
      ok: true,
      client: {
        id: client.id,
        name: client.name,
        clientCode: client.clientCode,
        document: client.document,
        contact: client.contact,
        phone: client.phone,
        email: client.email,
        address: formatAddress(client) || null,
      },
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return { ok: false, message: "Já existe um cliente com esse código." };
    }
    await captureServerError(error, "Falha ao salvar cliente", { clientId });
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  await verifySession();

  const client = await prisma.client.findUnique({
    where: { id },
    select: { _count: { select: { proposals: true } } },
  });

  if (!client) {
    redirect("/dashboard/clientes");
  }

  if (client._count.proposals > 0) {
    redirect("/dashboard/clientes?error=vinculada");
  }

  await prisma.client.delete({ where: { id } });
  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}
