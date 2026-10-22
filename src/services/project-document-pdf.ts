import "server-only";

import { MarkdownView } from "@/components/features/markdown-view";
import { DocumentBrandHeader } from "@/components/proposal/proposal-document-parts";
import { logger } from "@/lib/logger";
import { PROJECT_DOCUMENT_CSS } from "@/lib/project-document-css";
import type { Settings } from "@/services/settings";

type ProjectDocumentPdfInput = {
  projectName: string;
  title: string;
  content: string;
  settings: Settings;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function buildHtml({
  projectName,
  title,
  content,
  settings,
}: ProjectDocumentPdfInput): Promise<string> {
  const [{ createElement }, { renderToStaticMarkup }] = await Promise.all([
    import("react"),
    import("react-dom/server"),
  ]);

  const header = renderToStaticMarkup(
    createElement(DocumentBrandHeader, {
      settings,
      meta: createElement(
        "span",
        null,
        "Documento ",
        createElement("strong", null, title),
        createElement("br"),
        projectName,
      ),
    }),
  );
  const markdown = renderToStaticMarkup(createElement(MarkdownView, { content, plainLinks: true }));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>${PROJECT_DOCUMENT_CSS}</style>
</head>
<body>
<article class="markdown-doc-sheet">
${header}
${markdown}
</article>
</body>
</html>`;
}

export async function renderProjectDocumentPdf(input: ProjectDocumentPdfInput): Promise<Buffer> {
  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(await buildHtml(input), { waitUntil: "load" });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdf);
  } catch (error) {
    logger.error({ err: error, title: input.title }, "Falha ao gerar o PDF do documento");
    throw error;
  } finally {
    await browser.close();
  }
}
