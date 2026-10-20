# Proposta.ai

Gerador de propostas comerciais — criação, edição, gestão e exportação (PDF) de propostas para credenciamento e gestão de eventos.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilo:** Tailwind CSS v4 (design tokens em `src/app/globals.css`)
- **Banco:** PostgreSQL + Prisma ORM
- **Validação:** Zod
- **Qualidade:** ESLint, Prettier, Husky, lint-staged, commitlint

## Requisitos

- Node.js 22+
- PostgreSQL rodando localmente

## Setup

```bash
npm install
cp .env.example .env   # ajuste o DATABASE_URL se necessário
npm run db:migrate     # aplica as migrações
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                | Descrição                    |
| --------------------- | ---------------------------- |
| `npm run dev`         | Servidor de desenvolvimento  |
| `npm run build`       | Build de produção            |
| `npm run lint`        | ESLint                       |
| `npm run typecheck`   | Verificação de tipos (tsc)   |
| `npm run format`      | Formata com Prettier         |
| `npm run db:migrate`  | Cria/aplica migrações Prisma |
| `npm run db:studio`   | Prisma Studio                |
| `npm run db:generate` | Regenera o Prisma Client     |

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
- [Plano de desenvolvimento](./docs/plano-de-desenvolvimento.md)
- [Boas práticas Next.js](./docs/boas-praticas-nextjs.md)
- [Padrão de cores](./docs/padrao-de-cores.md)

## Convenção de commits

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) (validado por `commitlint` via hook):

```
feat: adiciona criação de proposta
fix: corrige cálculo do valor total
docs: atualiza plano de desenvolvimento
```
