import "server-only";

import { type CodePrefix, generateCode } from "@/lib/codes";
import { prisma } from "@/lib/prisma";

export async function generateUniqueCode(prefix: CodePrefix): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = generateCode(prefix);

    const existing =
      prefix === "CL"
        ? await prisma.client.findUnique({ where: { clientCode: code }, select: { id: true } })
        : await prisma.proposal.findUnique({ where: { code }, select: { id: true } });

    if (!existing) {
      return code;
    }
  }

  const now = Date.now().toString();
  return `${prefix}${now.slice(-4)}.${now.slice(-8, -4)}`;
}
