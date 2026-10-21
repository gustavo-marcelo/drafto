import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { PrismaClient } from "@prisma/client";

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

const SHARE_ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

function generateShareId(length = 16) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += SHARE_ALPHABET[randomInt(SHARE_ALPHABET.length)];
  }
  return id;
}

const prisma = new PrismaClient();

const proposals = await prisma.proposal.findMany({
  where: { shareId: null },
  select: { id: true },
});

const taken = new Set(
  (await prisma.proposal.findMany({ select: { shareId: true } }))
    .map((proposal) => proposal.shareId)
    .filter((shareId) => shareId !== null),
);

let updated = 0;

for (const proposal of proposals) {
  let shareId = generateShareId();
  while (taken.has(shareId)) {
    shareId = generateShareId();
  }
  taken.add(shareId);
  await prisma.proposal.update({ where: { id: proposal.id }, data: { shareId } });
  updated++;
}

console.log(`${updated} proposta(s) sem link público recebeu um shareId.`);
await prisma.$disconnect();
