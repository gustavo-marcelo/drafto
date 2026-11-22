# ✅ Melhores Práticas — Projeto Next.js

## 1. Visão Geral

Guia de boas práticas para estruturar, desenvolver e manter a aplicação Next.js (App Router) com segurança, desempenho e facilidade de manutenção.

---

## 2. Estrutura de Pastas

- Seguir a convenção do **App Router** (`app/`), organizando por rota:

  ```
  app/
  ├── (marketing)/        # rotas públicas (grupo de rotas)
  ├── (dashboard)/        # rotas autenticadas
  ├── api/                # rotas de API
  ├── layout.tsx
  └── page.tsx
  ├── components/         # componentes reutilizáveis
  │   ├── ui/             # botões, inputs, cards (primitivos)
  │   └── features/       # componentes de domínio
  ├── lib/                # utilitários, helpers, configuração
  ├── services/           # camada de acesso a dados / APIs externas
  ├── hooks/              # custom hooks
  ├── types/              # tipos e interfaces compartilhados
  └── styles/             # globals, tokens de design
  ```

- Neste repositório a estrutura fica sob `src/` (por exemplo, `src/app/`, `src/components/`).
- Usar **grupos de rotas** `(...)` para layouts distintos sem afetar a URL.
- Manter nomes de arquivos consistentes (`PascalCase` para componentes, `kebab-case` para demais).

---

## 3. Rendering: Server vs. Client

- **Padrão: Server Components.** Só adicione `"use client"` quando houver:

  - `useState` / `useEffect` / outros hooks
  - manipulação de eventos (`onClick`, `onChange`)
  - APIs exclusivas do browser (`window`, `localStorage`)

- Empurrar o mais perto possível da raiz os `"use client"` e reutilizar componentes server no interior.
- Escolher a estratégia de renderização por rota:

  | Estratégia         | Quando usar                               |
  | ------------------ | ----------------------------------------- |
  | `dynamic`          | Dados sempre frescos (dashboard, painel)  |
  | `revalidate` (ISR) | Conteúdo que muda pouco (blog, marketing) |
  | `force-static`     | Páginas totalmente estáticas              |

- Para dados por-request, preferir `await fetch(...)` diretamente no Server Component.

---

## 4. Busca de Dados e Cache

- Usar `fetch` nativo com opções de cache do Next.js:

  ```ts
  const res = await fetch(url, { next: { revalidate: 3600, tags: ["propostas"] } });
  ```

- Nomear **tags** e usá-las com `revalidateTag()` para invalidação sob demanda.
- Evitar buscar dados no cliente quando já podem ser obtidos no servidor (dupla requisição e vazamento de dados).
- Para dados extremamente dinâmicos, preferir **Streaming** com `Suspense` em vez de bloquear a página inteira.

---

## 5. Server Actions e Mutations

- Usar **Server Actions** para formulários e mutações — não endpoints API internos sem necessidade.
- Validar **sempre** os dados no servidor (nunca confiar no client):

  ```ts
  const schema = z.object({ titulo: z.string().min(3) });

  export async function criarProposta(formData: FormData) {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.flatten() };
    // ...
  }
  ```

- Retornar tipos de erro padronizados e revalidar com `revalidatePath()` / `revalidateTag()` após a mutação.

---

## 6. Segurança

- Nunca expor segredos com prefixo `NEXT_PUBLIC_` que não devem ser públicos.
- Validar TODA entrada de dados no servidor (formularios, webhooks, params).
- Proteger rotas autenticadas no **proxy** (no Next 16, o antigo `middleware.ts` virou `proxy.ts`) e revalidar no servidor:

  ```ts
  // src/proxy.ts
  export default async function proxy(req: NextRequest) {
    /* checa sessão */
  }
  ```

- Aplicar headers de segurança via `next.config.js` (CSP, `X-Frame-Options`, etc.).
- Em webhooks, validar assinatura (ex: Stripe) antes de processar.
- Rate limiting em rotas de API sensíveis (login, cadastro).

---

## 7. Desempenho

- Usar `next/image` em **todas** as imagens (otimização, `priority` apenas acima da dobra).
- Usar `next/font` para fontes — sem CLS e com `display: swap`.
- Diminuir o bundle:

  - importar bibliotecas pesadas dinamicamente: `const Chart = dynamic(() => import("..."))`
  - evitar `import *` e bibliotecas monolíticas (ex: `lodash` completo)

- Medir com `@next/bundle-analyzer` e Lighthouse CI.
- Prefetch apenas em links prováveis (padrão do `Link` do Next).
- Usar `loading.tsx` e `error.tsx` para UX de carregamento/erro.

---

## 8. Tipagem e Qualidade de Código

- **TypeScript estrito** (`strict: true`) — sem `any` desnecessário.
- Tipar props de componentes e retornos de Server Actions.
- Validação com **Zod** compartilhada entre client e server.
- Lint/format no commit:

  ```bash
  npm run lint && npm run typecheck
  ```

- Cobertura de testes nas camadas críticas:

  - **Unitários:** Vitest/Jest (`lib/`, `services/`)
  - **Integração/E2E:** Playwright (fluxos de login, criação de proposta)

---

## 9. Formulários e UX

- Validação no client (feedback imediato) **e** no servidor (fonte da verdade).
- Estados de loading com `useFormStatus` / `useTransition` (sem bloquear a UI).
- Otimistic UI para ações reversíveis.
- Acessibilidade: labels associados, foco visível, contraste AA, navegação por teclado.

---

## 10. Variáveis de Ambiente

- Separar por ambiente: `.env.local`, `.env.development`, `.env.production`.
- Expor no client apenas o prefixo `NEXT_PUBLIC_`.
- Tipar o `process.env` em `types/env.d.ts`.
- Nunca commitar `.env*` com segredos (verificar `.gitignore`).

---

## 11. Logging e Observabilidade

- Logs estruturados no servidor (nunca `console.log` em produção): `pino`, `winston` ou `instrumentation.ts`.
- Monitorar erros com Sentry (ou similar) integrado ao `error.tsx`.
- Rastrear métricas de Web Vitals.

---

## 12. CI/CD e Deploy

- Pipeline mínimo:

  ```bash
  npm ci
  npm run lint
  npm run typecheck
  npm run test
  npm run build
  ```

- Build reproduzível em ambiente de CI antes do deploy.
- Preview automático por PR (Vercel / self-hosted).
- Usar `output: "standalone"` para containers Docker.

---

## 13. Checklist Rápido antes de cada PR

- [ ] Sem `"use client"` desnecessário
- [ ] Validação de dados no servidor
- [ ] Nenhum segredo exposto ao client
- [ ] Imagens via `next/image`
- [ ] `loading.tsx` / `error.tsx` nas rotas principais
- [ ] Lint + typecheck + testes passando
- [ ] Sem `any` e sem `console.log` esquecidos
