export const SENTRY_DSN = process.env.SENTRY_DSN;

export const isSentryEnabled = Boolean(SENTRY_DSN);

export function tracesSampleRate(): number {
  const raw = process.env.SENTRY_TRACES_SAMPLE_RATE;
  if (raw === undefined) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
}

export function sentryEnvironment(): string {
  return process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
}
