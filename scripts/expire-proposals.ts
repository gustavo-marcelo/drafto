import { readFileSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

for (const raw of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) continue;
  let value = match[2];
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!process.env[match[1]]) process.env[match[1]] = value;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const { count } = await prisma.proposal.updateMany({
  where: { status: "SENT", validUntil: { lt: startOfToday } },
  data: { status: "EXPIRED" },
});

console.log(`${count} proposta(s) expirada(s).`);
await prisma.$disconnect();
