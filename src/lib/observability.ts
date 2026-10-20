import { logger } from "@/lib/logger";
import { isSentryEnabled } from "@/lib/monitoring";

type Context = Record<string, unknown>;

/**
 * Registra um erro estruturado no servidor e, quando o Sentry está configurado
 * (SENTRY_DSN presente), encaminha a exceção para monitoramento.
 */
export async function captureServerError(error: unknown, message: string, context?: Context) {
  logger.error({ err: error, ...context }, message);

  if (!isSentryEnabled) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.withScope((scope) => {
    if (context) scope.setContext("extra", context);
    Sentry.captureException(error);
  });
}
