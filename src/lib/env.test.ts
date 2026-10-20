import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const env = process.env as Record<string, string | undefined>;

async function loadGetEnv() {
  vi.resetModules();
  const mod = await import("@/lib/env");
  return mod.getEnv;
}

describe("getEnv", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    for (const key of Object.keys(env)) {
      if (!(key in ORIGINAL_ENV)) delete env[key];
    }
    Object.assign(env, ORIGINAL_ENV);
  });

  it("aceita variáveis válidas", async () => {
    env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    env.SESSION_SECRET = "a".repeat(40);
    const getEnv = await loadGetEnv();

    const parsed = getEnv();

    expect(parsed.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/db");
    expect(parsed.SESSION_SECRET).toBe("a".repeat(40));
  });

  it("rejeita DATABASE_URL ausente", async () => {
    delete env.DATABASE_URL;
    env.SESSION_SECRET = "a".repeat(40);
    const getEnv = await loadGetEnv();

    expect(() => getEnv()).toThrow(/DATABASE_URL/);
  });

  it("rejeita DATABASE_URL com protocolo inválido", async () => {
    env.DATABASE_URL = "mysql://user:pass@localhost/db";
    env.SESSION_SECRET = "a".repeat(40);
    const getEnv = await loadGetEnv();

    expect(() => getEnv()).toThrow(/postgresql/);
  });

  it("rejeita SESSION_SECRET curto", async () => {
    env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    env.SESSION_SECRET = "curto";
    const getEnv = await loadGetEnv();

    expect(() => getEnv()).toThrow(/SESSION_SECRET/);
  });

  it("trata variáveis opcionais do Sentry", async () => {
    env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    env.SESSION_SECRET = "a".repeat(40);
    env.SENTRY_DSN = "https://key@o1.ingest.sentry.io/1";
    env.SENTRY_TRACES_SAMPLE_RATE = "0.25";
    const getEnv = await loadGetEnv();

    const parsed = getEnv();

    expect(parsed.SENTRY_DSN).toBe("https://key@o1.ingest.sentry.io/1");
    expect(parsed.SENTRY_TRACES_SAMPLE_RATE).toBe(0.25);
  });

  it("rejeita SENTRY_DSN inválido", async () => {
    env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    env.SESSION_SECRET = "a".repeat(40);
    env.SENTRY_DSN = "não-é-url";
    const getEnv = await loadGetEnv();

    expect(() => getEnv()).toThrow(/SENTRY_DSN/);
  });

  it("rejeita LOG_LEVEL desconhecido", async () => {
    env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    env.SESSION_SECRET = "a".repeat(40);
    env.LOG_LEVEL = "verbose";
    const getEnv = await loadGetEnv();

    expect(() => getEnv()).toThrow(/LOG_LEVEL/);
  });
});
