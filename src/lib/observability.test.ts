import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const env = process.env as Record<string, string | undefined>;

describe("captureServerError", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    for (const key of Object.keys(env)) {
      if (!(key in ORIGINAL_ENV)) delete env[key];
    }
    Object.assign(env, ORIGINAL_ENV);
  });

  it("loga e não lança quando o Sentry está desabilitado", async () => {
    delete env.SENTRY_DSN;
    const { captureServerError } = await import("@/lib/observability");

    await expect(
      captureServerError(new Error("falha"), "Falha ao processar", { proposalId: "p1" }),
    ).resolves.toBeUndefined();
  });
});
