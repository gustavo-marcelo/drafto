"use client";

import * as Sentry from "@sentry/nextjs";

type ErrorContext = Record<string, unknown>;

/**
 * Reporta um erro de boundary/UI para o Sentry (no-op quando o DSN não está
 * configurado, pois o client do Sentry não é inicializado).
 */
export function reportClientError(error: Error & { digest?: string }, context?: ErrorContext) {
  Sentry.withScope((scope) => {
    if (context) scope.setContext("extra", context);
    if (error.digest) scope.setTag("digest", error.digest);
    Sentry.captureException(error);
  });
}
