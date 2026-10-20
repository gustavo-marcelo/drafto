# 🎨 Padrão de Cores — Design Tokens

## 1. Visão Geral

Este documento define a paleta de cores padrão do projeto. **Todos** os componentes devem utilizar exclusivamente os tokens abaixo — cores fixas (_hardcoded_) como `#fff` ou `blue-500` não são permitidas fora do arquivo de tokens.

---

## 2. Tokens de Cor

### 2.1. Accent (Cor de Destaque / Marca)

Utilizada em CTAs, destaques, links ativos e elementos de ênfase.

```css
--color-accent-50: #fff9e8;
--color-accent-100: #feeed4;
--color-accent-200: #f2ddb8;
--color-accent-300: #e5ca9b;
--color-accent-400: #d6b781;
--color-accent-500: #cfad72;
--color-accent-600: #c7a66b;
--color-accent-700: #aa8c55;
--color-accent-800: #907441;
--color-accent-900: #785f2f;
--color-accent-950: #60491c;
```

### 2.2. Primary (Cor Primária / Institucional)

Utilizada em navegação, cabeçalhos, botões secundários, ícones e elementos estruturais.

```css
--color-primary-50: #deefec;
--color-primary-100: #c8dfdb;
--color-primary-200: #a5c2bd;
--color-primary-300: #799c96;
--color-primary-400: #547a74;
--color-primary-500: #335b55;
--color-primary-600: #123b36;
--color-primary-700: #002824;
--color-primary-800: #001a16;
--color-primary-900: #000e0b;
--color-primary-950: #000403;
```

---

## 3. Escala de Tons e Uso

| Tom     | Faixa              | Uso recomendado                              |
| ------- | ------------------ | -------------------------------------------- |
| 50–100  | Fundos             | Backgrounds sutis, badges, hover leve        |
| 200–300 | Bordas             | Divisores, bordas de input, linhas de tabela |
| 400–500 | Ícones / Normal    | Ícones, gráficos, texto de apoio colorido    |
| 600–700 | Interação          | Botões, links, estado ativo                  |
| 800–900 | Texto              | Títulos e texto sobre fundos claros          |
| 950     | Texto forte / Dark | Texto de alto contraste, fundos escuros      |

---

## 4. Regras de Uso

- **Contraste mínimo AA** (4.5:1) para texto — validar pares ex:

  > ⚠️ A `accent` é uma cor **clara** (dourado `#C7A66B`). Texto branco sobre ela **não** atinge AA. Use sempre texto escuro (`primary-950`) sobre botões/fluxos accent.

  | Uso                      | Par permitido                                      |
  | ------------------------ | -------------------------------------------------- |
  | Texto em botão (accent)  | `primary-950` sobre `accent-600` (≈8.9:1)          |
  | Texto em botão (primary) | `white` sobre `primary-600` (≈12.3:1)              |
  | Link/texto sobre branco  | `accent-900` (≈6.0:1) — nunca `accent-700` (3.2:1) |
  | Fundo de alerta suave    | `accent-50`/`accent-100` com texto `accent-900`    |

- Escala consistente entre as duas famílias: mesmo número de tom = mesma intenção de uso.
- Hover: usar 1 tom **mais escuro** (ex: `accent-600` → `accent-700`).
- Fundo com tom claro + borda com tom 200/300 + texto com tom 800/900.
- Nunca usar tons 50–100 como cor de texto.
- Nunca usar tons 900–950 como fundo de botão de interação primária.

---

## 5. Semantic Tokens (Camada de abstração)

Para facilitar trocas futuras, os componentes devem referenciar tokens semânticos, não a escala diretamente:

```css
:root {
  /* Ações */
  --button-primary-bg: var(--color-primary-600);
  --button-primary-bg-hover: var(--color-primary-700);
  --button-accent-bg: var(--color-accent-600);
  --button-accent-bg-hover: var(--color-accent-700);

  /* Texto */
  --text-default: var(--color-primary-950);
  --text-muted: var(--color-primary-700);

  /* Superfícies */
  --surface-base: #ffffff;
  --surface-subtle: var(--color-primary-50);
  --surface-highlight: var(--color-accent-50);
  --border-default: var(--color-primary-200);
}
```

---

## 6. Exemplo de Implementação (Tailwind CSS)

```ts
// tailwind.config.ts
const colors = {
  accent: {
    50: "#fff9e8",
    100: "#feeed4",
    200: "#f2ddb8",
    300: "#e5ca9b",
    400: "#d6b781",
    500: "#cfad72",
    600: "#c7a66b",
    700: "#aa8c55",
    800: "#907441",
    900: "#785f2f",
    950: "#60491c",
  },
  primary: {
    50: "#deefec",
    100: "#c8dfdb",
    200: "#a5c2bd",
    300: "#799c96",
    400: "#547a74",
    500: "#335b55",
    600: "#123b36",
    700: "#002824",
    800: "#001a16",
    900: "#000e0b",
    950: "#000403",
  },
};

export default { theme: { extend: { colors } } };
```

Uso:

```tsx
<button className="bg-primary-600 hover:bg-primary-700 text-white">
  Salvar
</button>
<button className="bg-accent-600 hover:bg-accent-700 text-primary-950">
  Criar proposta
</button>
```

---

## 7. Checklist

- [ ] Nenhuma cor fixa fora do arquivo de tokens
- [ ] Componentes usando tokens semânticos (não a escala diretamente)
- [ ] Contraste AA validado nos pares texto/fundo
- [ ] Hover seguindo a regra de 1 tom mais escuro
- [ ] Ambas as famílias usadas com a mesma semântica de tom
