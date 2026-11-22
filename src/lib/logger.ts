import pino, { type Logger } from "pino";

function resolveLevel(): string {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function resolveTransport() {
  if (process.env.NODE_ENV !== "development") return undefined;
  return {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
  };
}

export const logger: Logger = pino({
  level: resolveLevel(),
  base: {
    env: process.env.NODE_ENV,
    service: "drafto",
  },
  redact: {
    paths: [
      "password",
      "*.password",
      "req.headers.authorization",
      "req.headers.cookie",
      "headers.authorization",
      "headers.cookie",
    ],
    remove: true,
  },
  transport: resolveTransport(),
});

export type { Logger };
