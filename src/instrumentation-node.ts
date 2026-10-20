import { isSentryEnabled, sentryEnvironment, tracesSampleRate } from "@/lib/monitoring";

export function registerNode() {
  if (!isSentryEnabled) return Promise.resolve();

  return import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: sentryEnvironment(),
      tracesSampleRate: tracesSampleRate(),
    });
  });
}
