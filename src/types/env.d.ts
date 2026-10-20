declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SESSION_SECRET: string;
    NODE_ENV: "development" | "production" | "test";
    SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    SENTRY_TRACES_SAMPLE_RATE?: string;
    LOG_LEVEL?: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    ADMIN_NAME?: string;
    CI?: string;
    E2E_PORT?: string;
  }
}
