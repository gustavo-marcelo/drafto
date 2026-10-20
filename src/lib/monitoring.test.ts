import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const env = process.env as Record<string, string | undefined>;

async function loadMonitoring() {
  vi.resetModules();
  return import("@/lib/monitoring");
}

describe("monitoring", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    for (const key of Object.keys(env)) {
      if (!(key in ORIGINAL_ENV)) delete env[key];
    }
    Object.assign(env, ORIGINAL_ENV);
  });

  it("desabilita o Sentry quando não há DSN", async () => {
    delete env.SENTRY_DSN;
    const { isSentryEnabled } = await loadMonitoring();

    expect(isSentryEnabled).toBe(false);
  });

  it("habilita o Sentry quando há DSN", async () => {
    env.SENTRY_DSN = "https://key@o1.ingest.sentry.io/1";
    const { isSentryEnabled } = await loadMonitoring();

    expect(isSentryEnabled).toBe(true);
  });

  describe("tracesSampleRate", () => {
    it("retorna 0 quando não definido", async () => {
      delete env.SENTRY_TRACES_SAMPLE_RATE;
      const { tracesSampleRate } = await loadMonitoring();

      expect(tracesSampleRate()).toBe(0);
    });

    it("faz clamp entre 0 e 1", async () => {
      const { tracesSampleRate } = await loadMonitoring();

      env.SENTRY_TRACES_SAMPLE_RATE = "2";
      expect(tracesSampleRate()).toBe(1);
      env.SENTRY_TRACES_SAMPLE_RATE = "-1";
      expect(tracesSampleRate()).toBe(0);
      env.SENTRY_TRACES_SAMPLE_RATE = "0.4";
      expect(tracesSampleRate()).toBe(0.4);
    });

    it("retorna 0 para valor não numérico", async () => {
      env.SENTRY_TRACES_SAMPLE_RATE = "abc";
      const { tracesSampleRate } = await loadMonitoring();

      expect(tracesSampleRate()).toBe(0);
    });
  });

  it("usa SENTRY_ENVIRONMENT quando definido", async () => {
    env.SENTRY_ENVIRONMENT = "staging";
    const { sentryEnvironment } = await loadMonitoring();

    expect(sentryEnvironment()).toBe("staging");
  });

  it("cai para NODE_ENV quando SENTRY_ENVIRONMENT não existe", async () => {
    delete env.SENTRY_ENVIRONMENT;
    env.NODE_ENV = "production";
    const { sentryEnvironment } = await loadMonitoring();

    expect(sentryEnvironment()).toBe("production");
  });
});
