import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url("SENTRY_DSN deve ser uma URL válida.").optional(),
);

const optionalNonEmpty = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const optionalCoercedNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0).max(1).optional(),
);

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL é obrigatória.")
    .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
      message: "DATABASE_URL deve ser uma URL postgresql:// ou postgres://.",
    }),
  SESSION_SECRET: z
    .string()
    .min(
      32,
      "SESSION_SECRET deve ter ao menos 32 caracteres (gere com `openssl rand -base64 32`).",
    ),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SENTRY_DSN: optionalUrl,
  SENTRY_ENVIRONMENT: optionalNonEmpty,
  SENTRY_TRACES_SAMPLE_RATE: optionalCoercedNumber,
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),
  ADMIN_EMAIL: z.preprocess(
    emptyToUndefined,
    z.email("ADMIN_EMAIL deve ser um e-mail válido.").optional(),
  ),
  ADMIN_PASSWORD: z.preprocess(
    emptyToUndefined,
    z.string().min(8, "ADMIN_PASSWORD deve ter ao menos 8 caracteres.").optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE,
    LOG_LEVEL: process.env.LOG_LEVEL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}
