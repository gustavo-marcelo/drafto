# Estado atual e pendências

Atualizado em **22/11/2026**. Documento de handoff para continuar o trabalho em outra sessão do opencode.

## 1. Resumo

- Branch: `dev` (alinhada com `origin/dev`). `main` é a branch de produção; o fluxo está descrito no [README](../README.md#fluxo-de-branches-e-versão).
- Últimos commits relevantes:
  - `ef54627` — `refactor: migra para Prisma 7, renomeia marca para Drafto e adiciona bump de versão`
  - `c54f0e7` — `style: reordena menu de projetos antes de propostas`
  - `a5aaa82` — `docs: registra estado atual e pendências`
- Árvore de trabalho limpa: a reordenação do menu em `src/components/layout/dashboard-shell.tsx` (Projetos antes de Propostas) foi commitada em `c54f0e7`.
- Validação em 22/11/2026: **144 testes unitários (17 arquivos)**, `typecheck` e `lint` passando. Os **32 testes E2E** seguem como referência de 23/10 — não foram reexecutados após a migração para Prisma 7.
- Stack atual: Next.js 16.4.6, React 19.3.1, Prisma 7.10.1 com `@prisma/adapter-pg` e cliente gerado em `src/generated/prisma` (pasta ignorada pelo Git).

## 2. O que foi entregue

### 2.1 Gestão de projetos e documentos Markdown

- Modelos `Project` e `ProjectDocument` em `prisma/schema.prisma`.
- Migração `prisma/migrations/20261022170553_add_projects/migration.sql`.
- CRUD de projetos e documentos em `/dashboard/projetos`.
- Busca por nome, descrição, cliente ou código do cliente.
- Editor de documentos Markdown com:
  - importação de `.md` / `.markdown`;
  - download do conteúdo como `.md`;
  - pré-visualização lado a lado em telas grandes (`lg`), com rolagem interna e `useDeferredValue`;
  - visualização renderizada no servidor com `react-markdown` + `remark-gfm`.
- Visualização dedicada em `/dashboard/projetos/[id]/documentos/[documentId]/visualizar`:
  - suporte a GFM (títulos, listas, tabelas, código, citações e links);
  - HTML bruto não executado;
  - botão **Imprimir** com layout A4 e navegação do dashboard oculta na impressão;
  - botão **Baixar PDF** via `GET /api/projetos/[id]/documentos/[documentId]/pdf` (Puppeteer, A4, cabeçalho da proposta, links como texto simples);
  - botão **Baixar .md** com o mesmo estilo visual do **Baixar PDF**;
  - componente reutilizável `MarkdownDownloadButton`, também usado no editor.
- Exclusão de projeto remove documentos em cascata (`onDelete: Cascade`).
- Clientes com propostas **ou** projetos vinculados não podem ser excluídos.

### 2.2 Associação de propostas a projetos

- `Proposal.projectId` opcional (`onDelete: SetNull`) e `Project.proposals`.
- Migração `prisma/migrations/20261022175111_add_proposal_project/migration.sql`.
- Campo **Projeto vinculado** na etapa 1 (Evento) do wizard:
  - filtra projetos pelo cliente selecionado;
  - selecionar um projeto preenche o cliente automaticamente;
  - trocar para um cliente incompatível limpa o projeto;
  - criar um novo cliente limpa o projeto;
  - link **Abrir documentos do projeto**.
- Validação no servidor em `saveProposalFull`: projeto precisa existir e pertencer ao mesmo cliente.
- Duplicação de proposta preserva `projectId`.
- Detalhe da proposta exibe card **Projeto vinculado**.
- Lista de propostas exibe coluna **Projeto** com link.
- Página do projeto exibe a seção **Propostas vinculadas** (código, título, status e atualização).
- Lista de projetos exibe a contagem de propostas.
- Excluir projeto desvincula as propostas, sem excluí-las.
- Confirmação de exclusão do projeto avisa que as propostas serão desvinculadas.

### 2.3 Documentação e testes

- `docs/projetos.md` documenta a feature, as regras e as evoluções possíveis.
- `docs/plano-de-desenvolvimento.md` atualizado com as entregas.
- `e2e/projects.spec.ts` cobre criação de projeto, documentos, prévia lado a lado, impressão, PDF, download `.md`, associação de proposta (com acesso aos documentos) e exclusão.
- `src/components/features/markdown-view.test.tsx` cobre links clicáveis e links como texto no PDF.
- `src/lib/validations/project.test.ts` cobre validação de projeto e documento.

## 3. Arquivos principais

| Área             | Arquivos                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema/migrações | `prisma/schema.prisma`, `prisma/migrations/20261022170553_add_projects/`, `prisma/migrations/20261022175111_add_proposal_project/`                                                                                                                   |
| Serviços         | `src/services/projects.ts`, `src/services/proposals.ts`, `src/services/project-document-pdf.ts`, `src/services/clients.ts`                                                                                                                           |
| Actions          | `src/app/actions/projects.ts`, `src/app/actions/wizard.ts`, `src/app/actions/proposals.ts`, `src/app/actions/clients.ts`                                                                                                                             |
| Páginas          | `src/app/dashboard/projetos/**`, `src/app/dashboard/propostas/**`, `src/app/dashboard/page.tsx`, `src/app/api/projetos/**`                                                                                                                           |
| Componentes      | `src/components/features/project-form.tsx`, `project-document-form.tsx`, `markdown-view.tsx`, `markdown-download-button.tsx`, `print-button.tsx`, `project-row-actions.tsx`, `project-document-row-actions.tsx`, `src/components/features/wizard/**` |
| Estilos          | `src/lib/project-document-css.ts`, `src/lib/proposal-document-css.ts`, `src/app/globals.css`                                                                                                                                                         |
| Validação        | `src/lib/validations/project.ts`, `src/lib/validations/wizard.ts`                                                                                                                                                                                    |
| Navegação        | `src/components/layout/dashboard-shell.tsx`                                                                                                                                                                                                          |

## 4. Banco de dados e migrações

- **Não executar `npx prisma migrate dev` neste repositório.** Ele falha porque a migração `20261021153000_infrastructure_replaces_equipment` foi modificada após ser aplicada e pede reset do banco. **Não resetar.**
- Para aplicar migrações manualmente:
  1. Criar a migração em `prisma/migrations/<timestamp>_<nome>/migration.sql`.
  2. Rodar `npx prisma migrate deploy` (a URL vem de `DATABASE_URL`, via `prisma.config.ts`).
  3. Rodar `npm run db:generate` (ou `npx prisma generate`).
- Com Prisma 7, o `datasource` do `prisma/schema.prisma` não declara mais `url`; ele é definido em `prisma.config.ts` com `env("DATABASE_URL")`. O client é gerado em `src/generated/prisma` e consumido via `@/generated/prisma/client` — não mais em `node_modules/.prisma`.
- As duas migrações de projetos já foram aplicadas no banco local.
- `prisma migrate diff` pode sugerir `DROP DEFAULT` não relacionados em `Infrastructure.updatedAt`, `ProposalInfrastructure.updatedAt` e `ProposalValueItem.updatedAt`; não incluir essas alterações sem necessidade.

## 5. Como validar

```bash
npx prettier --write <arquivos alterados>
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

Para rodar apenas o fluxo de projetos:

```bash
npx playwright test e2e/projects.spec.ts
```

Observação: o E2E usa a porta `3200` e faz build + start. A limpeza automática remove propostas e projetos com prefixo `E2E Projeto`.

## 6. Pendências

### Produto / evoluções planejadas

- Versionamento e histórico de alterações dos documentos do projeto.
- Exportação do projeto completo (Markdown ou PDF) com todos os anexos.
- Upload em lote de arquivos `.md`.
- Histórico de propostas por projeto com indicadores de status.

### Engenharia / infraestrutura

- Reduzir a repetição de `verifySession` nas páginas e Server Actions — `src/proxy.ts` já protege as rotas; avaliar centralização.
- Evitar que schemas Zod usados apenas no servidor entrem no bundle do cliente.
- Concluir itens de produção do plano: **6.3/6.6** — Docker standalone e deploy final com handoff.
- Avaliar testes unitários adicionais para as Server Actions de projetos e para o componente de download.

### Ambiente (22/11/2026)

- Working tree limpo na branch `dev`; nada pendente de commit.
- Revalidar `npm run test:e2e` após a migração para Prisma 7 antes de publicar (os 32 cenários foram executados pela última vez em 23/10).

## 7. Cuidados para a próxima sessão

- Este projeto usa Next.js 16 com `cacheComponents` + React `Activity`. O estado dos formulários é preservado e páginas antigas podem permanecer no DOM. Em E2E, prefira `getByRole(...)` e escopos específicos em vez de `page.locator("table")`.
- Consultar `node_modules/next/dist/docs/` antes de usar APIs do Next, conforme `AGENTS.md`.
- O cliente Prisma 7 fica em `src/generated/prisma` (ignorado pelo Git). Após `npm ci`, confirme que `npm run db:generate` rodou; sem essa pasta o build falha ao resolver `@/generated/prisma/client`.
- A cada merge na `main`, o workflow `.github/workflows/version-bump.yml` incrementa a versão patch e commita com `[skip ci]`; não edite `package.json`/`package-lock.json` manualmente apenas para versionar.
- Em `src/services/project-document-pdf.ts`, `react-dom/server` precisa ser importado **dinamicamente**. Import estático quebra o build com Turbopack.
- O PDF usa o cabeçalho da proposta apenas na primeira página; comportamento aceito até o momento.
- Links no PDF são renderizados como texto simples via `MarkdownView` com `plainLinks`.
- O botão **Baixar .md** usa `Blob` + `<a download>` no cliente; o nome do arquivo é gerado com `slugify(title)`.
- A prévia lado a lado depende de `data-document-editor` e `data-document-preview`; o E2E valida alturas com diferença de até 1px.
