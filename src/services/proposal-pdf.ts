import "server-only";

import { ProposalDocumentView } from "@/components/proposal/proposal-document-view";
import { logger } from "@/lib/logger";
import { PROPOSAL_DOCUMENT_CSS } from "@/lib/proposal-document-css";
import type { ProposalDocument } from "@/lib/proposal-document";
import {
  computeDocumentLayout,
  createDefaultDocumentLayout,
  isSameDocumentLayout,
  type ProposalDocumentLayout,
} from "@/lib/proposal-document-layout";

const MAX_LAYOUT_ITERATIONS = 6;

async function buildHtml(
  document: ProposalDocument,
  layout: ProposalDocumentLayout,
): Promise<string> {
  const [{ createElement }, { renderToStaticMarkup }] = await Promise.all([
    import("react"),
    import("react-dom/server"),
  ]);

  const body = renderToStaticMarkup(createElement(ProposalDocumentView, { document, layout }));

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
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    let layout = createDefaultDocumentLayout(document.modules.length);

    // Mede o documento renderizado e refaz o layout enquanto houver conteúdo
    // fora da área imprimível (seções cortadas no rodapé da página).
    for (let attempt = 0; attempt < MAX_LAYOUT_ITERATIONS; attempt++) {
      await page.setContent(await buildHtml(document, layout), { waitUntil: "load" });
      await page.emulateMediaType("print");

      const next = await page.evaluate(computeDocumentLayout, document.modules.length, layout);

      if (isSameDocumentLayout(next, layout)) {
        break;
      }

      layout = next;
    }

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
