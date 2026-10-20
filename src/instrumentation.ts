export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNode } = await import("@/instrumentation-node");
    await registerNode();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { registerEdge } = await import("@/instrumentation-edge");
    await registerEdge();
  }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  // Carrega o logger (pino, dependente de Node APIs) apenas no runtime Node,
  // evitando bundlá-lo no edge/middleware.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/lib/logger");
    logger.error(
      { err: error, path: request.path, method: request.method, ...context },
      "Erro não tratado na requisição",
    );
  }
}
