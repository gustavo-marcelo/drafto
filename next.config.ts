import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * Commit do Git no momento do build. Fica embutido nos bundles e serve para
 * identificar qual versão está no ar (roda em `GET /api/version` e aparece no
 * rodapé do documento).
 */
function gitCommit(): string {
  try {
    const commit = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    return commit || "sem-commit";
  } catch {
    return "sem-commit";
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    NEXT_PUBLIC_APP_COMMIT: gitCommit(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
