import "server-only";

import { ProposalDocumentView } from "@/components/proposal/proposal-document-view";
import { logger } from "@/lib/logger";
import { PROPOSAL_DOCUMENT_CSS } from "@/lib/proposal-document-css";
import type { ProposalDocument } from "@/lib/proposal-document";

async function buildHtml(document: ProposalDocument): Promise<string> {
  const [{ createElement }, { renderToStaticMarkup }] = await Promise.all([
    import("react"),
    import("react-dom/server"),
  ]);

  const body = renderToStaticMarkup(createElement(ProposalDocumentView, { document }));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${document.title || "Proposta Comercial"}</title>
<style>${PROPOSAL_DOCUMENT_CSS}</style>
</head>
<body class="doc-body">${body}</body>
</html>`;
}

export async function renderProposalPdf(document: ProposalDocument): Promise<Buffer> {
  const puppeteer = (await import("puppeteer")).default;
  const html = await buildHtml(document);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdf);
  } catch (error) {
    logger.error({ err: error, title: document.title }, "Falha ao gerar o PDF da proposta");
    throw error;
  } finally {
    await browser.close();
  }
}
