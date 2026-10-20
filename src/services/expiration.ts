import { prisma } from "@/lib/prisma";

export async function expireOverdueProposals(): Promise<number> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = await prisma.proposal.updateMany({
    where: { status: "SENT", validUntil: { lt: startOfToday } },
    data: { status: "EXPIRED" },
  });

  return result.count;
}
