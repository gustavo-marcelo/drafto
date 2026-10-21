# Deploy e Observabilidade

Guia de configuração de produção do Proposta.ai: variáveis de ambiente, segredos,
logs estruturados e monitoramento de erros.

## 1. Variáveis de ambiente

Todas as variáveis estão declaradas em `src/lib/env.ts` (validação com Zod no boot)
e documentadas em `.env.example`. Variáveis inválidas ou obrigatórias ausentes
fazem a aplicação falhar **cedo**, no primeiro acesso a `getEnv()`.

### Obrigatórias

| Variável         | Descrição                                                      | Exemplo                                             |
| ---------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`   | Conexão PostgreSQL (Prisma). Deve iniciar com `postgresql://`. | `postgresql://user:pass@host:5432/db?schema=public` |
| `SESSION_SECRET` | Chave HS256 dos cookies de sessão. **Mínimo 32 caracteres.**   | `openssl rand -base64 32`                           |

### Opcionais

| Variável                                | Descrição                                                    | Padrão                        |
| --------------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| `SENTRY_DSN`                            | DSN do Sentry (server). Sem valor, o Sentry fica desativado. | —                             |
| `SENTRY_ENVIRONMENT`                    | Ambiente reportado ao Sentry.                                | `NODE_ENV`                    |
| `SENTRY_TRACES_SAMPLE_RATE`             | Amostragem de tracing (0..1).                                | `0`                           |
| `NEXT_PUBLIC_SENTRY_DSN`                | DSN do Sentry exposto ao navegador.                          | —                             |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT`        | Ambiente do Sentry no cliente.                               | `NODE_ENV`                    |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Amostragem de tracing no cliente (0..1).                     | `0`                           |
| `LOG_LEVEL`                             | Nível do logger pino: `fatal`…`trace`/`silent`.              | `debug` (dev) / `info` (prod) |
| `ADMIN_EMAIL`                           | E-mail do usuário inicial criado pelo seed.                  | `demo@destrava.ai`            |
| `ADMIN_PASSWORD`                        | Senha do usuário inicial (mín. 8 caracteres).                | `proposta123`                 |
| `ADMIN_NAME`                            | Nome do usuário inicial.                                     | `Usuário Demo`                |

> **Segurança:** nunca comite o `.env` real (já ignorado no `.gitignore`). Em
> produção, injete os segredos pelo provedor (Docker secrets, Vercel env, etc.).
> Use valores distintos de `SESSION_SECRET` por ambiente — trocá-lo invalida
> todas as sessões ativas.

### Gerando segredos

```bash
openssl rand -base64 32   # SESSION_SECRET
```

## 2. Migrations e seed

```bash
npx prisma migrate deploy   # aplica migrations pendentes (produção)
npx prisma generate         # gera o client
npm run db:seed             # usuário inicial + catálogo + proposta demo
npm run db:expire           # expira propostas vencidas (agendar via cron)
npm run db:share-ids        # gera link público para propostas que ainda não têm shareId
```

## 3. Docker (app + banco)

O projeto sobe completo (aplicação + PostgreSQL) com Docker Compose. O build usa
`output: "standalone"` do Next (imagem enxuta) e o container da app roda o
Chromium embarcado (Puppeteer) para gerar PDFs.

### Arquivos

| Arquivo               | Papel                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| `Dockerfile`          | Multi-stage: `deps` → `builder` → `chrome` → `runner` (+ `migrate`).  |
| `docker-compose.yml`  | Serviços `db`, `migrate` (roda migrations e encerra), `app` e `seed`. |
| `.env.docker.example` | Modelo de variáveis do Compose (copie para `.env.docker`).            |
| `.dockerignore`       | Exclui `node_modules`, `.next`, testes, segredos e docs do contexto.  |

### Subindo

```bash
cp .env.docker.example .env.docker   # ajuste SESSION_SECRET e demais valores
docker compose --env-file .env.docker up --build
```

- `db` (Postgres 16) sobe primeiro e fica `healthy` (healthcheck `pg_isready`).
- `migrate` aplica `prisma migrate deploy` e encerra; a `app` só inicia depois
  (`service_completed_successfully`).
- Aplicação em `http://localhost:3000`; Postgres publicado em `${POSTGRES_PORT}`.

### Seed (opcional)

```bash
docker compose --env-file .env.docker --profile seed run --rm seed
```

Cria o usuário inicial (a partir de `ADMIN_EMAIL`/`ADMIN_PASSWORD` do
`.env.docker`), o catálogo de recursos e a proposta demo. Rode apenas quando
quiser popular o banco.

### Operação

```bash
docker compose --env-file .env.docker logs -f app     # logs da aplicação
docker compose --env-file .env.docker ps              # status dos serviços
docker compose --env-file .env.docker down            # para tudo (mantém volume)
docker compose --env-file .env.docker down -v         # para tudo e apaga o banco
```

> **Portas:** para evitar conflito com um Postgres local, defina `POSTGRES_PORT`
> (ex.: `55432`) no `.env.docker`. O `DATABASE_URL` interno sempre aponta para o
> serviço `db:5432`.

> **Segredos:** o `.env.docker` real está no `.gitignore`. Em produção, prefira
> Docker secrets ou o gerenciador de segredos do provedor.

> **Sem Docker?** Para rodar em um Raspberry Pi com PostgreSQL local, veja
> [deploy-raspberry.md](./deploy-raspberry.md).

## 4. Logs estruturados

O servidor usa [pino](https://getpino.io) em `src/lib/logger.ts`:

- **Produção:** JSON de uma linha por evento (pronto para agregadores).
- **Desenvolvimento:** `pino-pretty` (colorido e legível).
- Campos base: `env`, `service: "proposta.ai"`.
- **Redaction:** `password`, `authorization` e `cookie` são removidos automaticamente.

Uso:

```ts
import { logger } from "@/lib/logger";

logger.info({ proposalId, userId }, "Proposta publicada");
logger.error({ err }, "Falha ao gerar PDF");
```

Para erros em server actions/services, prefira `captureServerError` (ver abaixo),
que loga **e** encaminha ao Sentry.

## 5. Sentry (monitoramento de erros)

A integração é **opcional e ativada por DSN**: sem `SENTRY_DSN` (server) e/ou
`NEXT_PUBLIC_SENTRY_DSN` (cliente), nada é enviado e as chamadas são no-op.

### Como funciona

| Arquivo                          | Papel                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/instrumentation.ts`         | `register()` inicializa o Sentry (node/edge); `onRequestError()` captura erros não tratados do servidor (Server Components, Route Handlers, Server Actions, Proxy). |
| `src/instrumentation-client.ts`  | Inicializa o Sentry no navegador e registra breadcrumbs de navegação.                                                                                               |
| `src/lib/observability.ts`       | `captureServerError(error, msg, ctx)` — loga + captura (server).                                                                                                    |
| `src/lib/report-client-error.ts` | `reportClientError(error, ctx)` — usado pelos error boundaries.                                                                                                     |

### Error boundaries

- `src/app/error.tsx` — erros das rotas públicas/raiz.
- `src/app/global-error.tsx` — erros do layout raiz (define `<html>`/`<body>`).
- `src/app/dashboard/error.tsx` — erros do dashboard.
- `src/app/not-found.tsx` — página 404 personalizada.

Todos reportam ao Sentry via `reportClientError` (no-op sem DSN).

### Ativando

```bash
SENTRY_DSN="https://<key>@o<org>.ingest.sentry.io/<project>"
NEXT_PUBLIC_SENTRY_DSN="https://<key>@o<org>.ingest.sentry.io/<project>"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE="0.1"
```

## 6. Healthcheck manual

```bash
curl -sI http://localhost:3000/            # 200
curl -sI http://localhost:3000/dashboard   # 307 → /login (sem sessão)
curl -s  http://localhost:3000/nao-existe  # página 404 personalizada
```
