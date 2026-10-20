"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/auth";
import { generateShareId } from "@/lib/codes";
import { prisma } from "@/lib/prisma";
import { type WizardActionResult, wizardSchema } from "@/lib/validations/wizard";
import { generateUniqueCode } from "@/services/codes";

function buildRelations(data: ReturnType<typeof wizardSchema.parse>) {
  return {
    modules: {
      create: data.modules.map((module) => ({
        key: module.key,
        title: module.title,
        description: module.description || null,
      })),
    },
    equipment: {
      create: data.equipment.map((item) => ({
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        specs: item.specs || null,
      })),
    },
    payments: {
      create: data.payments.map((payment) => ({
        dueDate: new Date(payment.dueDate),
        amount: payment.amount,
      })),
    },
    schedule: {
      create: data.schedule.map((item, index) => ({
        date: item.date,
        title: item.title,
        description: item.description || null,
        position: index,
      })),
    },
  };
}

export async function saveProposalFull(
  input: unknown,
  proposalId?: string,
): Promise<WizardActionResult> {
  const { userId } = await verifySession();

  const parsed = wizardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const payload = {
    paymentMethod: data.paymentMethod || null,
    includedCosts: data.includedCosts || null,
    requirements: data.requirements || null,
    disclaimer: data.disclaimer || null,
    acceptanceNote: data.acceptanceNote || null,
  };

  const base = {
    title: data.title,
    subtitle: data.subtitle || null,
    eventDate: data.eventDate ? new Date(data.eventDate) : null,
    issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
    location: data.location || null,
    audience: data.audience || null,
    solution: data.solution || null,
    validUntil: data.validUntil ? new Date(data.validUntil) : null,
    totalAmount: data.totalAmount ?? null,
    clientId: data.clientId || null,
    packageId: data.packageId || null,
    payload,
  };

  const stored = await prisma.$transaction(async (tx) => {
    if (proposalId) {
      await tx.proposalModule.deleteMany({ where: { proposalId } });
      await tx.equipment.deleteMany({ where: { proposalId } });
      await tx.payment.deleteMany({ where: { proposalId } });
      await tx.proposalScheduleItem.deleteMany({ where: { proposalId } });

      return tx.proposal.update({
        where: { id: proposalId },
        data: { ...base, ...buildRelations(data) },
        select: { id: true },
      });
    }

    return tx.proposal.create({
      data: {
        ...base,
        code: await generateUniqueCode("PR"),
        shareId: generateShareId(),
        authorId: userId,
        ...buildRelations(data),
      },
      select: { id: true },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/propostas/${stored.id}`);

  return { ok: true, proposalId: stored.id };
}

export async function applyPackageToProposal(
  proposalId: string,
  packageId: string,
): Promise<WizardActionResult> {
  await verifySession();

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) {
    return { ok: false, message: "Pacote não encontrado." };
  }

  const payload = (pkg.payload ?? {}) as {
    recursos?: string[];
    equipamentos?: { name: string; quantity?: number; specs?: string; description?: string }[];
  };

  const modules = (payload.recursos ?? []).map((title) => ({
    key: title,
    title,
    description: null,
  }));

  const equipment = (payload.equipamentos ?? []).map((item) => ({
    name: item.name,
    description: item.description ?? null,
    quantity: item.quantity ?? 1,
    specs: item.specs ?? null,
  }));

  await prisma.$transaction(async (tx) => {
    await tx.proposal.update({
      where: { id: proposalId },
      data: {
        packageId,
        audience: pkg.audience ?? undefined,
        modules: { create: modules },
        equipment: { create: equipment },
      },
    });
  });

  revalidatePath(`/dashboard/propostas/${proposalId}`);
  return { ok: true, proposalId };
}
