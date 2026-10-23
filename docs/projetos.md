# 📁 Projetos e documentos Markdown

## 1. Visão geral

A funcionalidade de **Projetos** permite organizar o trabalho realizado para um cliente e manter os documentos do projeto anexados em formato Markdown.

Cada projeto:

- possui **nome** e uma **breve descrição**;
- é vinculado a **um cliente** já cadastrado;
- pode ter **vários documentos** anexados;
- pode ter **várias propostas** vinculadas;
- tem seus documentos armazenados como texto Markdown no banco.

A área fica disponível no dashboard em **Projetos** (`/dashboard/projetos`), ao lado de Propostas e Clientes.

## 2. Modelo de dados

### `Project`

| Campo         | Tipo       | Regra                           |
| ------------- | ---------- | ------------------------------- |
| `id`          | `String`   | `cuid()` gerado automaticamente |
| `name`        | `String`   | Nome do projeto                 |
| `description` | `String`   | Breve descrição do projeto      |
| `clientId`    | `String`   | Cliente vinculado (obrigatório) |
| `createdAt`   | `DateTime` | Criado automaticamente          |
| `updatedAt`   | `DateTime` | Atualizado automaticamente      |

Relações:

- `Project.client` → `Client` (`onDelete: Restrict`): o cliente só pode ser excluído quando não possui propostas **nem** projetos.
- `Project.documents` → `ProjectDocument[]` (`onDelete: Cascade`): excluir o projeto remove seus documentos.
- `Project.proposals` → `Proposal[]` (`onDelete: SetNull`): excluir o projeto **desvincula** as propostas, sem excluí-las.

### `ProjectDocument`

| Campo       | Tipo       | Regra                                |
| ----------- | ---------- | ------------------------------------ |
| `id`        | `String`   | `cuid()` gerado automaticamente      |
| `title`     | `String`   | Título do documento                  |
| `content`   | `String`   | Conteúdo em Markdown                 |
| `projectId` | `String`   | Projeto ao qual o documento pertence |
| `createdAt` | `DateTime` | Criado automaticamente               |
| `updatedAt` | `DateTime` | Atualizado automaticamente           |

Migrações: `prisma/migrations/20261022170553_add_projects/migration.sql` (projetos e documentos) e `prisma/migrations/20261022175111_add_proposal_project/migration.sql` (vínculo `Proposal.projectId`).

## 3. Rotas

| Rota                                                          | Descrição                               |
| ------------------------------------------------------------- | --------------------------------------- |
| `/dashboard/projetos`                                         | Lista e busca projetos                  |
| `/dashboard/projetos/novo`                                    | Cadastro de projeto                     |
| `/dashboard/projetos/[id]`                                    | Edição do projeto e lista de documentos |
| `/dashboard/projetos/[id]/documentos/novo`                    | Anexar novo documento Markdown          |
| `/dashboard/projetos/[id]/documentos/[documentId]`            | Editar documento Markdown               |
| `/dashboard/projetos/[id]/documentos/[documentId]/visualizar` | Visualizar o Markdown renderizado       |

Todas as rotas exigem sessão autenticada (`verifySession()` e proteção via `src/proxy.ts`).

## 4. Documentos Markdown

O editor de documentos permite:

- escrever o conteúdo diretamente no campo **Conteúdo (Markdown)**;
- importar um arquivo `.md`/`.markdown` — o conteúdo é carregado no editor e o título é sugerido a partir do nome do arquivo;
- baixar o documento atual como `.md`;
- editar ou excluir documentos pela página do projeto.

O conteúdo é armazenado como texto no campo `ProjectDocument.content`, preservando a sintaxe Markdown sem conversão para HTML no banco. A edição usa um campo monoespaçado para manter a fidelidade do texto.

Em telas grandes (`lg`), o editor exibe **formulário e pré-visualização lado a lado**: a prévia acompanha o conteúdo enquanto você digita e os dois painéis ficam com a mesma altura, com rolagem interna na prévia. Em telas menores, a pré-visualização aparece abaixo do editor. Internamente é usado `useDeferredValue` para evitar travar a digitação em documentos maiores.

A visualização dedicada em `/dashboard/projetos/[id]/documentos/[documentId]/visualizar` renderiza o Markdown no servidor com `react-markdown` + `remark-gfm`:

- suporte a títulos, listas, tabelas, blocos de código, citações e links (GFM);
- HTML bruto não é executado (comportamento seguro padrão do `react-markdown`);
- links são abertos em nova aba;
- na página dedicada, a renderização é server-side; no editor, a biblioteca também é carregada no cliente para atualizar a prévia em tempo real;
- o botão **Baixar PDF** chama `GET /api/projetos/[id]/documentos/[documentId]/pdf` e gera o arquivo no servidor com Puppeteer, em A4, usando o **mesmo cabeçalho da proposta** (logo, empresa, tagline) e a identificação do projeto/documento;
- o botão **Baixar .md** faz o download do documento original em Markdown, tanto na visualização quanto no editor;
- no PDF, os links do Markdown são renderizados como **texto simples**, sem âncoras clicáveis (`MarkdownView` com `plainLinks`), e não há link público/compartilhável do documento;
- o botão **Imprimir** usa a impressão do navegador com o mesmo layout A4; menus, barra de ações e navegação do dashboard são ocultados;
- os estilos de impressão ficam em `src/lib/project-document-css.ts` e reutilizam o cabeçalho da proposta (`DocumentBrandHeader`).

## 5. Propostas vinculadas

No wizard de proposta (etapa **Evento**), o campo **Projeto vinculado** permite associar a proposta a um projeto do mesmo cliente:

- ao escolher um projeto, o cliente da proposta é preenchido automaticamente;
- ao trocar o cliente, o projeto é limpo se pertencer a outro cliente;
- a lista de projetos é filtrada pelo cliente selecionado;
- o link **Abrir documentos do projeto** leva diretamente à página do projeto;
- a página de detalhe da proposta exibe um card **Projeto vinculado**;
- a lista de propostas mostra o projeto em uma coluna própria;
- a página do projeto lista as **Propostas vinculadas** com código, título, status e data de atualização;
- a lista de projetos exibe a contagem de propostas.

A associação é opcional. Ao excluir o projeto, as propostas continuam existindo e ficam sem vínculo (`projectId = null`). A duplicação de uma proposta preserva o projeto vinculado.

## 6. Implementação

| Camada         | Arquivo(s)                                                                                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validação      | `src/lib/validations/project.ts`                                                                                                                                                                                |
| Serviços       | `src/services/projects.ts`, `src/services/clients.ts`, `src/services/project-document-pdf.ts`                                                                                                                   |
| Server Actions | `src/app/actions/projects.ts`                                                                                                                                                                                   |
| Componentes    | `src/components/features/project-form.tsx`, `project-document-form.tsx`, `markdown-view.tsx`, `markdown-download-button.tsx`, `print-button.tsx`, `project-row-actions.tsx`, `project-document-row-actions.tsx` |
| Estilos        | `src/lib/project-document-css.ts`, `src/lib/proposal-document-css.ts`                                                                                                                                           |
| Páginas        | `src/app/dashboard/projetos/**`                                                                                                                                                                                 |
| API            | `src/app/api/projetos/[id]/documentos/[documentId]/pdf/route.ts`                                                                                                                                                |
| Navegação      | `src/components/layout/dashboard-shell.tsx` (ícone `IconFolder`)                                                                                                                                                |

### Server Actions

- `saveProject(input, projectId?)` — cria ou atualiza o projeto e valida o cliente.
- `deleteProject(id)` — exclui o projeto e seus documentos (cascade).
- `saveProjectDocument(projectId, input, documentId?)` — cria ou atualiza um documento do projeto.
- `deleteProjectDocument(projectId, documentId)` — exclui um documento e volta para o projeto.

### Regras de negócio

1. Todo projeto exige um cliente existente.
2. O nome do projeto deve ter ao menos 2 caracteres.
3. A descrição é obrigatória (ao menos 3 caracteres).
4. O título do documento deve ter ao menos 2 caracteres e o conteúdo não pode ser vazio.
5. Clientes com propostas ou projetos vinculados não podem ser excluídos.
6. A exclusão do projeto remove todos os documentos anexados e desvincula as propostas.
7. A proposta só pode ser vinculada a um projeto do mesmo cliente.
8. Após criar um projeto ou documento, o formulário de criação é limpo para que o próximo cadastro comece vazio (o estado não é preservado pelo cache de navegação do Next.js).

## 7. Testes

- `src/lib/validations/project.test.ts` cobre validação de projeto e de documento.
- `e2e/projects.spec.ts` cobre o fluxo de criação do projeto, anexo, visualização e edição de documento Markdown, download do `.md`, associação de proposta ao projeto (e acesso aos documentos pelo detalhe da proposta) e exclusão do projeto.
- `npm run test`, `npm run typecheck` e `npm run lint` devem passar antes do commit.

## 8. Evoluções possíveis

- Versionamento/histórico de alterações dos documentos.
- Exportação do projeto completo (Markdown ou PDF) com todos os anexos.
- Upload em lote de arquivos `.md`.
- Histórico de propostas por projeto com indicadores de status.
