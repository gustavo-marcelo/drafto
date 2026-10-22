# Proposta.ai

Gerador de propostas comerciais — criação, edição, gestão e exportação (PDF) de propostas para credenciamento e gestão de eventos. Inclui gestão de projetos por cliente com documentos anexados em Markdown.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilo:** Tailwind CSS v4 (design tokens em `src/app/globals.css`)
- **Banco:** PostgreSQL + Prisma ORM
- **Validação:** Zod
- **Qualidade:** ESLint, Prettier, Husky, lint-staged, commitlint

## Requisitos

- Node.js 22+
- PostgreSQL rodando localmente (ou Docker — veja abaixo)

## Setup (local)

```bash
npm install
cp .env.example .env   # ajuste o DATABASE_URL se necessário
npm run db:migrate     # aplica as migrações
npm run db:seed        # cria o usuário inicial + dados de exemplo
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O usuário inicial padrão é
`demo@destrava.ai` / `proposta123` (configurável via `ADMIN_EMAIL`/`ADMIN_PASSWORD`).

## Docker (app + banco)

Sobe a aplicação **e** o PostgreSQL com um comando. O build usa o output
`standalone` do Next e o container da app já inclui o Chromium (Puppeteer) para
gerar os PDFs.

```bash
cp .env.docker.example .env.docker   # ajuste SESSION_SECRET (openssl rand -base64 32)
docker compose --env-file .env.docker up --build
```

Acesse [http://localhost:3000](http://localhost:3000).

- `db` — PostgreSQL 16 com healthcheck e volume persistente (`db-data`).
- `migrate` — aplica as migrações (`prisma migrate deploy`) e encerra; a app só
  inicia depois.
- `app` — Next.js em modo produção, publicado em `${APP_PORT}`.

Para popular o banco (usuário inicial + catálogo + proposta demo):

```bash
docker compose --env-file .env.docker --profile seed run --rm seed
```

Comandos úteis:

```bash
docker compose --env-file .env.docker logs -f app    # logs da aplicação
docker compose --env-file .env.docker ps             # status dos serviços
docker compose --env-file .env.docker down           # para tudo (mantém o banco)
docker compose --env-file .env.docker down -v        # para tudo e apaga o banco
```

> Se já houver um PostgreSQL local na porta 5432, defina `POSTGRES_PORT` (ex.:
> `55432`) no `.env.docker`. Detalhes em
> [docs/deploy-e-observabilidade.md](./docs/deploy-e-observabilidade.md).

## Scripts

| Script                | Descrição                           |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento         |
| `npm run build`       | Build de produção                   |
| `npm run start`       | Inicia o build de produção          |
| `npm run lint`        | ESLint                              |
| `npm run typecheck`   | Verificação de tipos (tsc)          |
| `npm run test`        | Testes unitários (Vitest)           |
| `npm run test:e2e`    | Testes E2E (Playwright)             |
| `npm run format`      | Formata com Prettier                |
| `npm run db:migrate`  | Cria/aplica migrações Prisma        |
| `npm run db:seed`     | Popula o banco com dados de exemplo |
| `npm run db:expire`   | Expira propostas vencidas           |
| `npm run db:studio`   | Prisma Studio                       |
| `npm run db:generate` | Regenera o Prisma Client            |

## Estrutura

```
src/
├── app/          # rotas (App Router)
├── components/   # ui/ (primitivos) e features/ (domínio)
├── lib/          # utilitários e integrações (ex: prisma)
├── services/     # acesso a dados
├── hooks/        # custom hooks
└── types/        # tipos compartilhados
docs/             # especificação, plano e padrões
prisma/           # schema e migrações
```

## Documentação

- [Especificação](./docs/especificacao.md)
- [Projetos e documentos Markdown](./docs/projetos.md)
- [Plano de desenvolvimento](./docs/plano-de-desenvolvimento.md)
- [Deploy e observabilidade](./docs/deploy-e-observabilidade.md)
- [Deploy no Raspberry Pi](./docs/deploy-raspberry.md)
- [Boas práticas Next.js](./docs/boas-praticas-nextjs.md)
- [Padrão de cores](./docs/padrao-de-cores.md)

## Convenção de commits

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) (validado por `commitlint` via hook):

```
feat: adiciona criação de proposta
fix: corrige cálculo do valor total
docs: atualiza plano de desenvolvimento
```
