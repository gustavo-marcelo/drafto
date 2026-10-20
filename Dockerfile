# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Base comum
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1

# Retries e IPv4: evita falhas intermitentes de DNS/IPv6 no build.
RUN echo 'Acquire::Retries "5";' > /etc/apt/apt.conf.d/80-retries \
  && echo 'Acquire::ForceIPv4 "true";' > /etc/apt/apt.conf.d/99-force-ipv4

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ─────────────────────────────────────────────────────────────────────────────
# 1) Dependências (com cache do Puppeteer/Chromium)
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ─────────────────────────────────────────────────────────────────────────────
# 2) Build da aplicação (Next standalone + Prisma client)
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS builder
ENV NODE_ENV=production
# Valores apenas para satisfazer a validação de env (src/lib/env.ts) durante a
# coleta de dados do build. O runtime usa as variáveis reais do compose.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV SESSION_SECRET="build-time-placeholder-secret-min-32-chars-long"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Baixa o Chromium do Puppeteer para uma pasta previsível, para copiar depois.
FROM base AS chrome
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 \
    libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 \
    libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 \
    libxext6 libxfixes3 libxkbcommon0 libxrandr2 wget unzip \
  && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_CACHE_DIR=/home/puppeteer/.cache/puppeteer
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci \
  && rm -rf "$PUPPETEER_CACHE_DIR" \
  && npx puppeteer browsers install chrome

# ─────────────────────────────────────────────────────────────────────────────
# 3) Runner (imagem final enxuta)
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Bibliotecas de sistema exigidas pelo Chromium (Puppeteer) para gerar PDFs.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 \
    libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 \
    libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 \
    libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Chromium baixado na stage `chrome` (pasta com o navegador).
ENV PUPPETEER_CACHE_DIR=/home/nextjs/.cache/puppeteer
COPY --from=chrome --chown=nextjs:nodejs /home/puppeteer/.cache/puppeteer /home/nextjs/.cache/puppeteer

# Artefatos do Next standalone.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

# ─────────────────────────────────────────────────────────────────────────────
# 4) Migrações (roda `prisma migrate deploy` e encerra)
#    Usado pelo serviço `migrate` do docker-compose antes de subir a app.
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS migrate
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]

# ─────────────────────────────────────────────────────────────────────────────
# 5) Seed (roda `tsx prisma/seed.ts`). Opcional, via profile `seed`.
#    Copia `src/lib` porque o seed importa o catálogo padrão.
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS seed
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src/lib ./src/lib
RUN npx prisma generate
CMD ["./node_modules/.bin/tsx", "prisma/seed.ts"]
