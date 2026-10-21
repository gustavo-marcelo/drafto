"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { generateShareId } from "@/lib/codes";
import { captureServerError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { canTransition, STATUS_LABELS } from "@/lib/proposal-status";
import { proposalStatusEnum } from "@/lib/validations/proposal";
import { generateUniqueCode } from "@/services/codes";
import type { ProposalStatus } from "@prisma/client";

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus,
): Promise<{ ok: boolean; message?: string }> {
  await verifySession();

  const parsed = proposalStatusEnum.safeParse(status);
  if (!parsed.success) {
    return { ok: false, message: "Status inválido." };
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!proposal) {
    return { ok: false, message: "Proposta não encontrada." };
  }

  if (!canTransition(proposal.status, parsed.data)) {
    return {
      ok: false,
      message: `Transição de "${STATUS_LABELS[proposal.status]}" para "${STATUS_LABELS[parsed.data]}" não é permitida.`,
    };
  }

  try {
    await prisma.proposal.update({
      where: { id },
      data: { status: parsed.data },
      select: { id: true },
    });
  } catch (error) {
    await captureServerError(error, "Falha ao alterar o status da proposta", {
      proposalId: id,
      from: proposal.status,
      to: parsed.data,
    });
    return { ok: false, message: "Não foi possível alterar o status." };
  }

  revalidatePath(`/dashboard/propostas/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function duplicateProposal(id: string): Promise<void> {
  await verifySession();

  const original = await prisma.proposal.findUnique({
    where: { id },
    include: { modules: true, infrastructure: true, valueItems: true, payments: true },
  });

  if (!original) {
    return;
  }

  const copy = await prisma.proposal.create({
    data: {
      code: await generateUniqueCode("PR"),
      shareId: generateShareId(),
      title: `${original.title} (cópia)`,
      subtitle: original.subtitle,
      eventDate: original.eventDate,
      issuedAt: original.issuedAt,
      location: original.location,
      audience: original.audience,
      solution: original.solution,
      validUntil: original.validUntil,
      totalAmount: original.totalAmount,
      payload: original.payload ?? undefined,
      clientId: original.clientId,
      packageId: original.packageId,
      authorId: original.authorId,
      status: "DRAFT",
      modules: {
        create: original.modules.map((module) => ({
          key: module.key,
          title: module.title,
          description: module.description,
        })),
      },
      infrastructure: {
        create: original.infrastructure.map((item) => ({
          key: item.key,
          title: item.title,
          description: item.description,
        })),
      },
      payments: {
        create: original.payments.map((payment) => ({
          dueDate: payment.dueDate,
          amount: payment.amount,
        })),
      },
      valueItems: {
        create: original.valueItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue,
          position: item.position,
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/propostas/${copy.id}`);
}

export async function deleteProposal(id: string): Promise<void> {
  await verifySession();
  await prisma.proposal.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
