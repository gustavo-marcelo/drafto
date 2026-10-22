import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarkdownView } from "./markdown-view";

describe("MarkdownView", () => {
  it("renderiza links como âncoras clicáveis por padrão", () => {
    const html = renderToStaticMarkup(<MarkdownView content="[Site](https://example.com)" />);

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
  });

  it("renderiza links como texto simples no modo do PDF", () => {
    const html = renderToStaticMarkup(
      <MarkdownView content="[Site](https://example.com)" plainLinks />,
    );

    expect(html).toContain("Site");
    expect(html).not.toContain("<a");
    expect(html).not.toContain("href=");
  });
});
