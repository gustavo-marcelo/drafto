import { readFileSync } from "node:fs";
import path from "node:path";

import { connection } from "next/server";

import { APP_COMMIT } from "@/lib/app-version";

/** Início do processo: ajuda a identificar um processo antigo no ar. */
const STARTED_AT = new Date().toISOString();

/**
 * Identificador do build gerado pelo Next (`.next/BUILD_ID`). É lido do disco
 * porque muda a cada build — é o que permite checar se o servidor está
 * servindo o build recém-gerado.
 */
function readBuildId(): string | null {
  const candidates = [
    path.join(process.cwd(), ".next", "BUILD_ID"),
    path.join(process.cwd(), ".next", "standalone", ".next", "BUILD_ID"),
  ];

  for (const candidate of candidates) {
    try {
      const buildId = readFileSync(candidate, "utf8").trim();
      if (buildId) {
        return buildId;
      }
    } catch {
      // tenta o próximo caminho
    }
  }

  return null;
}

export async function GET() {
  // O build em execução só pode ser lido em tempo de requisição.
  await connection();

  return Response.json({
    version: APP_COMMIT,
    buildId: readBuildId(),
    startedAt: STARTED_AT,
    node: process.version,
  });
}
