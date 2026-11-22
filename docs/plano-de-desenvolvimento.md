# 🗺️ Plano de Desenvolvimento — Drafto

## 1. Visão Geral

Plano de execução em etapas para construir a aplicação web de criação, gestão e exportação (PDF) de propostas comerciais, conforme a [Especificação](./especificacao.md) e o [Padrão de Cores](./padrao-de-cores.md).

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + PostgreSQL + Puppeteer.

**Cronograma estimado:** 8 a 10 semanas (1 dev full-stack).

**Status atual (22/11/2026):** Fases 0–5 concluídas. Fase 6 em andamento — 6.1 (Vitest), 6.2 (Playwright), 6.4 (segredos) e 6.5 (observabilidade) concluídas; 6.3 (Docker standalone) e 6.6 (deploy final) pendentes. Em 22/11 o projeto passou a usar Next.js 16.4.6, React 19.3.1 e Prisma 7.10.1 (client gerado em `src/generated/prisma`), além de adotar o nome **Drafto**.

---

## 2. Fases e Etapas

### Fase 0 — Fundação (Semana 1) ✅ CONCLUÍDA

| #   | Etapa                                                                    | Entregável                             | Status |
| --- | ------------------------------------------------------------------------ | -------------------------------------- | ------ |
| 0.1 | Inicializar projeto Next.js + TypeScript + Tailwind                      | Repo com `npm run dev` funcional       | ✅     |
| 0.2 | Configurar ESLint, Prettier, Husky e commit conventions                  | Pipeline local de qualidade            | ✅     |
| 0.3 | Definir estrutura de pastas (`app/`, `components/`, `lib/`, `services/`) | Scaffold conforme boas práticas        | ✅     |
| 0.4 | Implementar design tokens de cores (accent/primary)                      | Tokens aplicados no Tailwind           | ✅     |
| 0.5 | Configurar banco (PostgreSQL + Prisma)                                   | Migração inicial `init` aplicada       | ✅     |
| 0.6 | CI básico (lint + typecheck + build)                                     | Workflow em `.github/workflows/ci.yml` | ✅     |

**Critério de saída:** app builda, linta e conecta ao banco. ✅ **Atendido.**

**Notas de implementação:**

- Stack efetiva (22/11/2026): Next.js 16.4.6, React 19.3.1, Tailwind v4.3.5 (tokens via `@theme`), Prisma 7.10.1, TypeScript 6 e Vitest 5.
- Banco local: `postgresql://proposta@localhost:5432/propostadb`.
- Prisma 8 (RC) continua descartado por ser release candidate. O projeto usou Prisma 6.x até 22/10 e migrou para o 7.10.1 (stable) em 22/11: generator `prisma-client` com saída `src/generated/prisma`, driver adapter `@prisma/adapter-pg`, URL em `prisma.config.ts` (via `env("DATABASE_URL")`) e scripts cron em `.ts` executados com `tsx`.
- CI roda sobre Postgres 16 em container e executa `migrate deploy` + lint + typecheck + build.
- **Reorganização (20/10):** banco recriado do zero com migração única `20261020192559_init` (13 migrações incrementais esmagadas), `prisma/schema.prisma` reescrito em seções comentadas (semântica idêntica — validada com `migrate diff`) e configuração migrada de `package.json#prisma` para `prisma.config.ts` (+ `dotenv` como devDependency).

---

### Fase 1 — Modelo de Dados e Auth (Semana 2) ✅ CONCLUÍDA

| #   | Etapa                                                                           | Entregável                | Status |
| --- | ------------------------------------------------------------------------------- | ------------------------- | ------ |
| 1.1 | Modelar entidades: `Proposta`, `Cliente`, `Infraestrutura`, `Pacote`, `Usuario` | Schema no ORM + migrações | ✅     |
| 1.2 | Implementar autenticação (Auth.js / Clerk / Supabase Auth)                      | Login/logout funcionando  | ✅     |
| 1.3 | Proteger rotas do dashboard via middleware                                      | Área logada isolada       | ⚠️     |
| 1.4 | Seed de dados de teste                                                          | Ambiente de dev populado  | ✅     |

**Critério de saída:** usuário loga e o schema suporta todos os blocos da especificação (2.1–2.5). ✅ **Atendido.**

**Notas de implementação:**

- Auth própria com `bcryptjs` (hash) + `jose` (JWT) + cookie de sessão — não foi usada lib de auth de terceiros.
- Modelos no schema: `User`, `Resource`, `Infrastructure`, `Client`, `Package`, `Proposal`, `ProposalModule`, `ProposalInfrastructure`, `Payment` (enum `ProposalStatus`).
- **⚠️ 1.3 — Divergência do plano:** a proteção foi feita com `verifySession()` chamado em **cada** `page.tsx` e Server Action do dashboard **e** por `src/proxy.ts` (equivalente ao `middleware.ts` no Next 16 — renomeado para `proxy` nesta versão). Funciona, mas as checagens por página/action são repetitivas — centralizar é melhoria recomendada (ver §7).
- Seed popula usuário demo (`demo@drafto.ai` / `proposta123`), cliente, pacote e proposta de exemplo.

---

### Fase 2 — CRUD de Propostas e Dashboard (Semanas 3–4) ✅ CONCLUÍDA

| #   | Etapa                                                                              | Entregável                         | Status |
| --- | ---------------------------------------------------------------------------------- | ---------------------------------- | ------ |
| 2.1 | Listagem de propostas com status (Rascunho, Enviada, Aprovada, Recusada, Expirada) | Tabela/página inicial do dashboard | ✅     |
| 2.2 | Filtros e busca (cliente, código, datas, título do evento)                         | Filtros funcionais                 | ✅     |
| 2.3 | Ações: criar, editar, duplicar, excluir                                            | CRUD completo via Server Actions   | ✅     |
| 2.4 | Validação com Zod (client + server)                                                | Erros claros e seguros             | ✅     |
| 2.5 | Estados `loading.tsx` e `error.tsx` nas rotas                                      | UX de carregamento/erro            | ✅     |

**Critério de saída:** ciclo completo de criação e edição de uma proposta salva no banco. ✅ **Atendido.**

**Notas de implementação:**

- Listagem (`dashboard/page.tsx`) exibe código, título, status, cliente, valor e data; busca por título/código/cliente via `listProposals`.
- Server Actions em `actions/proposals.ts` (criar/editar/duplicar/excluir) e `actions/wizard.ts` (criação em 4 passos). Duplicação gera novo código único.
- Validação Zod em `lib/validations/`, compartilhada entre client e server.
- `dashboard/loading.tsx` e `dashboard/error.tsx` criados.

---

### Fase 3 — Formulário Wizard (Semanas 5–6) ✅ CONCLUÍDA

| #   | Etapa                                                                          | Entregável                            | Status |
| --- | ------------------------------------------------------------------------------ | ------------------------------------- | ------ |
| 3.1 | Estrutura do wizard de 4 passos com navegação e validação por passo            | Wizard navegável                      | ✅     |
| 3.2 | Passo 1: Dados do Evento e do Cliente                                          | Formulário completo                   | ✅     |
| 3.3 | Passo 2: Módulos do sistema e infraestrutura (checkboxes a partir do catálogo) | Itens dinâmicos                       | ✅     |
| 3.4 | Passo 3: Valores, parcelamento e condições comerciais                          | Tabela financeira editável            | ✅     |
| 3.5 | Passo 4: Requisitos operacionais e pré-visualização                            | Formulário final                      | ✅     |
| 3.6 | Templates reutilizáveis ("Pacotes Padrão")                                     | CRUD de pacotes + aplicação no wizard |

**Critério de saída:** proposta preenchida de ponta a ponta sem tocar o banco manualmente. ✅ **Atendido.**

**Notas de implementação:**

- `proposal-wizard.tsx` + 4 steps (`step-evento`, `step-modulos`, `step-financeiro`, `step-operacional`); criação em transação única.
- **Composição do valor (passo 3):** antes de "Custos incluídos", bloco com vários itens (descrição, quantidade, valor unitário e subtotal calculado) que detalham o total da proposta (`ProposalValueItem`, migração `20261021154500_add_proposal_value_items`). Com itens, o campo "Valor total (R$)" fica somente leitura e assume a soma dos subtotais; sem itens, o usuário digita o total manualmente.
- CRUD completo de Pacotes (`dashboard/pacotes/*`) com `applyPackageToProposal` para pré-preencher o wizard.
- Passo 1 permite criar cliente novo inline (`NewClientForm`).

---

### Fase 4 — Preview em Tempo Real e PDF (Semanas 6–8) ✅ CONCLUÍDA

| #   | Etapa                                                              | Entregável                   | Status |
| --- | ------------------------------------------------------------------ | ---------------------------- | ------ |
| 4.1 | Layout split-screen (formulário à esquerda, preview à direita)     | Atualização em tempo real    | ✅     |
| 4.2 | Template HTML/CSS da proposta (3 páginas, fiel ao modelo original) | Visual idêntico ao PDF final | ✅     |
| 4.3 | Cabeçalho/rodapé com logo e numeração de páginas                   | Template padronizado         | ✅     |
| 4.4 | Motor de PDF (Puppeteer ou react-pdf) com as 3 páginas             | Export pixel-perfect         | ✅     |
| 4.5 | Geração de link público (página somente-leitura da proposta)       | Link compartilhável          | ✅     |

**Critério de saída:** PDF gerado com fidelidade visual e preview atualizando a cada digitação. ✅ **Atendido.**

**Notas de implementação:**

- **Decisão tomada:** Puppeteer (HTML→PDF) em vez de `@react-pdf/renderer` — fidelidade pixel-perfect ao template CSS.
- **Template compartilhado:** `ProposalDocumentView` (React) + `PROPOSAL_DOCUMENT_CSS` (string injetada) servem o preview em tempo real no wizard, a página pública e o PDF — sem drift entre eles.
- **Documento:** A4 com número variável de páginas ("Página X de N" no rodapé). O fluxo é contínuo: apresentação e cliente, catálogo de recursos, infraestrutura e operação, requisitos pré-evento, cronograma e compromissos; a página de valores ("Condições comerciais" no topo, composição do valor e aceite/assinaturas) sempre começa uma nova página.
- **Paginação dinâmica (motor de blocos):** o documento é lido como um fluxo contínuo de blocos (`intro`, `resources`, `infrastructure`, `requirements`, `schedule`, `disclaimer`, `values`) e o layout é `{ pages: ProposalDocumentBlock[][] }` (`lib/proposal-document-layout.ts`). Requisitos, cronograma e compromissos **continuam na sequência** (sem página reservada só para eles) e apenas o bloco `values` inicia uma nova página, sempre com "Condições comerciais" no topo. Blocos de recursos e cronograma são divisíveis: o solver mede a altura real de cada item no browser e corta o bloco no ponto em que a soma dos itens (por linhas, em duas colunas no catálogo) mais o título do bloco ultrapassa o topo do rodapé — nada é cortado. `computeDocumentLayout` é autossuficiente (sem imports nem bindings do módulo) porque é serializada para dentro do browser pelo Puppeteer. A medição roda nos três lugares: preview do wizard e página pública (`ProposalDocumentAutoLayout`, até 6 iterações, refazendo o layout quando a quantidade de itens muda) e PDF (`services/proposal-pdf.ts` repete `setContent` + `page.evaluate` antes do `page.pdf()`). O rodapé e o rótulo "N páginas · A4" do preview acompanham a contagem real.
- **Recursos x Infraestrutura:** as seções "Recursos do sistema de credenciamento" e "Infraestrutura e operação" ficam empilhadas com o título em largura total; os itens de cada seção são distribuídos em duas colunas (`column-count: 2`) e seção sem itens não é exibida.
- **Composição do valor:** na página de valores, a tabela "Composição do valor" (Descrição · Qtd. · Valor unitário · Subtotal) vem depois de "Condições comerciais" e é omitida quando não há itens. A linha de fechamento da tabela é rotulada "Investimento" e usa fundo suave (`--doc-bg-soft`) com texto em verde-petróleo, na mesma pegada da linha de cabeçalho "Descrição" e sem a barra escura de destaque; "Condições comerciais" não repete a linha "Valor total".
- **Split-screen:** wizard reestruturado em grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]`, preview à direita com escala 0.42, atualiza a cada digitação via `wizardToDocument(data, selectedClient)`.
- **PDF:** `services/proposal-pdf.ts` gera HTML do componente e renderiza via Puppeteer (headless, args anti-sandbox). Rotas: `/api/propostas/[id]/pdf` (autenticada) e `/api/propostas/publicas/[shareId]/pdf` (pública).
- **Link público:** `Proposal.shareId` (16 chars, `crypto.getRandomValues`) + página `/p/[shareId]` somente-leitura com botão "Baixar PDF"; ações "Baixar PDF" e "Abrir link público" na página de detalhe da proposta.
- **Ajuste Next.js 16:** `cacheComponents` exige `export const instant = false` na página pública (consulta ao banco dinâmica); import de `react-dom/server` deve ser dinâmico nas rotas.

---

### Fase 5 — Fluxo de Status, Publicação e Polimento (Semanas 8–9) ✅ CONCLUÍDA

| #   | Etapa                                                               | Entregável             | Status |
| --- | ------------------------------------------------------------------- | ---------------------- | ------ |
| 5.1 | Máquina de status (Rascunho → Enviada → Aprovada/Recusada/Expirada) | Transições validadas   | ✅     |
| 5.2 | Marcação automática de expirada (validade da proposta)              | Job/cron de expiração  | ✅     |
| 5.3 | UX de feedback (toast, optimistic UI) em mutações                   | Interfaces responsivas | ✅     |
| 5.4 | Acessibilidade e contraste AA conforme padrão de cores              | Auditoria a11y         | ✅     |
| 5.5 | Otimização de performance (bundle analyzer, imagens, fonts)         | Web Vitals em verde    | ✅     |

**Critério de saída:** fluxo completo do usuário real, do rascunho ao aceite. ✅ **Atendido.**

**Notas de implementação:**

- **5.1 ✅:** máquina de transições em `lib/proposal-status.ts` (`PROPOSAL_TRANSITIONS`, `canTransition`, `allowedStatuses`); Server Action `updateProposalStatus` valida a transição antes de gravar; `ProposalStatusControl` no cabeçalho da edição renderiza **apenas as opções permitidas** para o status atual (com toast de sucesso/erro). Enum ampliado com `COMPLETED`/`CANCELLED`; label `APPROVED` = "Aceita". Reabrir volta ao `Rascunho`; `EXPIRED` é exclusivamente automático.
- **5.2 ✅:** `services/expiration.ts` (`expireOverdueProposals`: `SENT` + `validUntil < hoje`) chamado lazy no carregamento do `dashboard/page.tsx` e da edição, mais script cron `npm run db:expire` (`scripts/expire-proposals.ts`).
- **Link público na duplicação:** `duplicateProposal` gera um novo `shareId` para a cópia (antes a cópia ficava sem link e sem as ações "Abrir link público"/"Copiar link"); o script idempotente `npm run db:share-ids` (`scripts/ensure-share-ids.ts`) completa propostas antigas que ficaram sem `shareId`.
- **5.3 ✅:** `sonner` instalado e `<Toaster>` no layout raiz; toasts no salvar do wizard, na mudança de status, nos textos pré-definidos (save/delete **otimistas** com snapshot/revert), em duplicar/excluir proposta e nos exclusões de cliente/pacote/recurso — todos disparados **antes** do `redirect()` da Server Action, sobrevivendo à navegação.
- **5.4 ✅:** contraste AA já validado na Fase 5/paleta; nesta etapa: `:focus-visible` global (outline primary), skip link "Pular para o conteúdo" (`#conteudo`) no dashboard, `aria-label` na navegação e nos filtros, `scope="col"` nos `<th>`, `aria-hidden` nos separadores do wizard, `<main>` nas páginas públicas. **Auditoria axe-core em 10 páginas: 0 violações** (qualquer impacto).
- **5.5 ✅:** scripts `npm run analyze` (`next build --analyze`) e `next analyze`; pior rota (edição de proposta) com 665 KB de JS na primeira carga (**194 KB gzip**), baseline das demais ~502 KB (~145 KB gzip) — composição: react-dom ~72 KB gz + runtime Next ~36 KB + zod ~30 KB gz + sonner ~13 KB gz. Fonts já self-hosted via `next/font/google` (Geist). Web Vitals medidos em produção (local): TTFB 3–14 ms, FCP 28–156 ms, LCP 56–372 ms — todos na faixa "good". Oportunidade futura: schemas Zod importados por componentes client (~30 KB gz) poderiam ficar server-only.

---

### Fase 6 — Testes, Deploy e Lançamento (Semana 10) 🟡 EM ANDAMENTO

| #   | Etapa                                                        | Entregável                    | Status |
| --- | ------------------------------------------------------------ | ----------------------------- | ------ |
| 6.1 | Testes unitários (`lib/`, `services/`) com Vitest            | Cobertura das regras críticas | ✅     |
| 6.2 | Testes E2E (Playwright): login, criar proposta, exportar PDF | Fluxo principal automatizado  | ✅     |
| 6.3 | Configurar produção (Docker standalone)                      | Ambiente publicado            | ⬜     |
| 6.4 | Variáveis de ambiente e segredos em produção                 | `.env` documentado e seguro   | ✅     |
| 6.5 | Monitoramento de erros (Sentry) e logs estruturados          | Observabilidade ativa         | ✅     |
| 6.6 | Deploy final + handoff (docs de uso e manutenção)            | MVP no ar                     | ⬜     |

**Critério de saída:** aplicação em produção, monitorada e com testes rodando no CI.

**Notas de implementação:**

- **6.1 ✅:** `vitest.config.ts` (alias `@`, coverage v8, `src/**/*.test.ts` e `src/**/*.test.tsx`). **17 arquivos / 144 testes** cobrindo `lib/app-version` (versão exibida na tela de login), `lib/codes`, `lib/format`, `lib/package-payload`, `lib/proposal-document-wizard`, `lib/proposal-document-layout` (solver de paginação por blocos), `lib/proposal-status`, `lib/validations/*` (incluindo projetos e documentos Markdown), `lib/env`, `lib/logger`, `lib/monitoring`, `lib/observability`, `services/expiration` (Prisma mockado) e `components/proposal/proposal-document-view` (render estático do documento, incluindo a composição do valor, o valor total sem itens, os dados do contratante, o nível do título (`h1`/`h2`) e a paginação por layout) e `components/features/markdown-view` (links clicáveis na tela e links como texto simples no PDF). Scripts `test`, `test:watch`, `test:coverage`.
- **6.2 ✅:** `playwright.config.ts` (chromium, webServer em `:3200` com `build && start`, `reuseExistingServer: !CI`, retries em CI), `e2e/fixtures.ts` (credenciais do seed + `login()`) e specs `auth.spec.ts` / `proposal.spec.ts` / `users.spec.ts` / `infrastructure.spec.ts` / `value-items.spec.ts` / `pagination.spec.ts` / `landing.spec.ts` / `settings.spec.ts` / `version.spec.ts` / `projects.spec.ts`. **32 testes**: login válido/inválido, rota protegida, logout, ausência do cadastro público, navegação, criação completa pelo wizard (com cronograma), salvar edição, PDF autenticado/público, gestão de usuários (criar, duplicidade, editar e alternar visibilidade da senha) e infraestrutura (página protegida, CRUD do catálogo, proposta pública e seleção no wizard/preview) composição do valor (total livre sem itens, itens com subtotal e total automático), duplicação (a cópia mantém as ações de link público) e paginação dinâmica (catálogo extenso gera páginas extras sem cortar seções, blocos de operação em sequência e página de valores sempre começando com "Condições comerciais") e versão da aplicação (`GET /api/version` com commit, `BUILD_ID` e início do processo) e landing page institucional (apresentação do produto com CTA para `/login`, navegação pelas seções, ausência da versão do build na página pública e auditoria de acessibilidade com `axe-core`) e hierarquia de títulos do documento (preview do wizard com `h2` e um único `h1` na página; página pública com o título do documento em `h1`) e projetos (criação, anexo de documento Markdown, edição e exclusão em cascata, associação de proposta ao projeto e acesso aos documentos pelo detalhe da proposta). Limpeza automática das propostas `E2E Proposta *`, `E2E Composição *`, `E2E Paginação *`, projetos `E2E Projeto *` e usuários `e2e-*` via `afterAll`. Scripts `test:e2e`, `test:e2e:ui`.
- **CI:** job `quality` agora roda `npm run test`; novo job `e2e` sobe Postgres, aplica `migrate deploy` + `db:seed`, instala Chromium (`playwright install --with-deps`) e roda `npm run test:e2e`, publicando o `playwright-report` como artefato.
- **6.4 ✅:** validação de env com Zod em `src/lib/env.ts` (`getEnv()`, cacheado, falha cedo com mensagens por variável); `SESSION_SECRET` exige ≥32 caracteres; `types/env.d.ts` ampliado (`SENTRY_*`, `LOG_LEVEL`, `CI`, `E2E_PORT`). `.env.example` reescrito e comentado (obrigatórias × opcionais + como gerar segredos). Guia completo em `docs/deploy-e-observabilidade.md`. +2 arquivos de teste (`env.test.ts`, `monitoring.test.ts`).
- **6.5 ✅:** logger estruturado `pino` (`src/lib/logger.ts`) com redaction de segredos e `pino-pretty` em dev; integrado em `services/proposal-pdf.ts`, `actions/proposals.ts`, `actions/clients.ts` e no `onRequestError` global (`src/instrumentation.ts`). Sentry **opcional via DSN** (`@sentry/nextjs` v11): `instrumentation.ts` (server node/edge) + `instrumentation-client.ts` (browser + breadcrumbs de navegação), `captureServerError` (`lib/observability.ts`) e `reportClientError` (`lib/report-client-error.ts`). Error boundaries novos: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` (e `dashboard/error.tsx` instrumentado) — todos no-op sem DSN.
- **22/11 (fora das etapas acima):** rebrand de `Proposta.ai`/`destrava.ai` para **Drafto** (nome do pacote, metadados, textos da landing, e-mails do seed e `service` dos logs) e workflow `.github/workflows/version-bump.yml`, que incrementa a versão patch em `package.json`/`package-lock.json` a cada merge na `main` e commita com `[skip ci]`. Ver [README](../README.md#fluxo-de-branches-e-versão).

---

## 3. Entregas Fora do Plano Original

Durante as Fases 1–3 foram acrescentados itens não previstos, já integrados:

| Item                                  | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Códigos de entidade**               | `Client.clientCode` (`CL####.####`) e `Proposal.code` (`PR####.####`) únicos, com geração automática (`services/codes.ts`) e exibição nas telas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Contato do cliente ampliado**       | Campos `phone` (formatação BR) e `email` (validado) no cliente, com busca e seed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Troca de paleta de cores**          | Primary `#123B36` (verde-petróleo) + accent `#C7A66B` (dourado), escalas 50–950 regeradas em OKLCH e contraste AA/AAA revalidado.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Recurso (`Resource`)**              | Modelo/tela de "Recursos" adicionado (`dashboard/recursos/*`) além do previsto.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Infraestrutura (`Infrastructure`)** | Catálogo e tela de "Infraestrutura e operação" (`dashboard/infraestrutura/*`), no mesmo padrão de `Resource`. Substitui o modelo `Equipment`: os equipamentos existentes foram convertidos em itens de infraestrutura pela migração `20261021153000_infrastructure_replaces_equipment` e a seção do PDF passou a ficar na página 1, logo abaixo de "Recursos".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Textos pré-definidos**              | `TextPreset` (solução/requisitos/aceite/custos) com CRUD e inserção nos campos do wizard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Edição por etapas**                 | Cabeçalho com etapas 1–4 clicáveis (validação ao pular), salvar com toasts e machine de status ampliada (`COMPLETED`/`CANCELLED`, "Aceita").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Gestão de usuários**                | Cadastro público removido (rota `/register` eliminada). Novos usuários são criados por usuários logados em `dashboard/usuarios` (`instant = false`); usuário inicial criado pelo seed via `ADMIN_EMAIL`/`ADMIN_PASSWORD`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Landing page institucional**        | Página pública em `/` (`src/app/page.tsx` + `src/components/landing/*`) com hero, recursos, passo a passo, estrutura do documento, público-alvo, FAQ e CTA para `/login`. Conteúdo estático (sem consulta ao banco), sem exibir a versão do build e com auditoria de acessibilidade (`axe-core`) no E2E.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Refactor do documento**             | `ProposalDocumentView` quebrado em `proposal-document-parts.tsx` (blocos, tabelas, cabeçalho e rodapé) com renderização declarativa por tipo de bloco; contrato de DOM centralizado em `src/lib/proposal-document-dom.ts` (o solver recebe os seletores por argumento, pois é serializado para o browser); preview do wizard passa a exibir os dados do contratante e o valor total; título do documento em `h2` dentro do wizard (sem duplicar o `h1` da página); CSS do documento modularizado em blocos temáticos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Projetos e documentos Markdown**    | Novos modelos `Project` (nome, breve descrição e `clientId` obrigatório) e `ProjectDocument` (título e conteúdo Markdown), com migração `20261022170553_add_projects`, e vínculo opcional `Proposal.projectId` (`onDelete: SetNull`) via migração `20261022175111_add_proposal_project`. Dashboard em `dashboard/projetos/*` (lista com busca, cadastro, edição e exclusão), editor de documentos com importação de `.md`/`.markdown`, download em Markdown e pré-visualização lado a lado em telas grandes, e visualização renderizada server-side com `react-markdown` + `remark-gfm` na rota `.../documentos/[documentId]/visualizar`, com geração de PDF no servidor (Puppeteer, A4, links como texto) e impressão pelo navegador, reutilizando o cabeçalho da proposta. O wizard de propostas permite associar um projeto do mesmo cliente, com cliente preenchido automaticamente; a proposta exibe o vínculo no detalhe e na lista, e o projeto lista suas propostas. A exclusão do projeto remove os documentos em cascata e desvincula as propostas; clientes com projetos vinculados não podem ser excluídos. Validação Zod em `lib/validations/project.ts` e testes em `project.test.ts`. Documentação dedicada em `docs/projetos.md`. |

---

## 4. Resumo do Cronograma

```
Sem 1  ████ Fase 0 — Fundação            ✅
Sem 2  ████ Fase 1 — Dados e Auth        ✅
Sem 3  ████ Fase 2 — CRUD e Dashboard    ✅
Sem 4  ████ Fase 2 — CRUD e Dashboard    ✅
Sem 5  ████ Fase 3 — Wizard              ✅
Sem 6  ████ Fase 4 — Preview + PDF       ✅
Sem 7  ████ Fase 4 — PDF                 ✅
Sem 8  ████ Fase 5 — Fluxo + Polimento   ✅
Sem 9  ████ Fase 5 — Polimento           ✅
Sem 10 ████ Fase 6 — Testes e Deploy     🟡
```

---

## 5. Riscos e Mitigações

| Risco                                | Impacto | Mitigação                                                                    |
| ------------------------------------ | ------- | ---------------------------------------------------------------------------- |
| Fidelidade do PDF ao modelo original | Alto    | Priorizar template HTML/CSS fiel já na Fase 4; validar cedo com exemplo real |
| Escopo do wizard crescer             | Médio   | Congelar campos após revisão da especificação; templates para atalhos        |
| Performance do preview em tempo real | Médio   | Debounce + memoização; render server-side do preview                         |
| Geração de PDF lenta (Puppeteer)     | Médio   | Fila/async + cache; considerar react-pdf se necessário                       |
| Proteção de rotas repetitiva         | Médio   | `verifySession` repetido em page/action além do `src/proxy.ts`; centralizar  |
| Sem testes antes do deploy           | Alto    | ✅ Mitigado: Vitest (144 testes) + Playwright (32 E2E) no CI                 |

---

## 6. Fora do Escopo desta Versão

- Portal do cliente com assinatura digital
- Multi-tenant / múltiplas empresas
- Integração com faturamento/ERP
- App do totem (módulo de credenciamento) — especificado, mas separado deste MVP

---

## 7. Próximos Passos Imediatos

1. **Reduzir repetição de `verifySession`** — `src/proxy.ts` já protege rotas; avaliar centralizar as checagens por camada nas páginas/actions.
2. **Escapar Zod do bundle client** — schemas usados só no server reduziriam ~30 KB gzip da primeira carga.
3. **Configurar produção (6.3/6.6)** — Docker standalone e deploy final com handoff.
4. **Revalidar E2E após o upgrade** — os 32 cenários Playwright foram executados pela última vez em 23/10, antes da migração para Prisma 7.
