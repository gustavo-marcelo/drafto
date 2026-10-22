import { PROPOSAL_DOCUMENT_HEADER_CSS } from "@/lib/proposal-document-css";

export const PROJECT_DOCUMENT_CSS = `
${PROPOSAL_DOCUMENT_HEADER_CSS}

.markdown-doc-sheet {
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
  padding: 18mm 16mm 20mm;
  background: #ffffff;
  color: var(--doc-ink);
  border: 1px solid var(--color-primary-100);
  border-radius: 0.5rem;
}

.markdown-doc-sheet,
.markdown-doc-sheet * { box-sizing: border-box; }

.markdown-doc-sheet .doc-header { margin-bottom: 8mm; }

.markdown-doc-sheet .doc-header-meta {
  max-width: 85mm;
  overflow-wrap: anywhere;
}

.markdown-doc-sheet .markdown-view {
  color: var(--doc-ink);
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.55;
}

.markdown-doc-sheet .markdown-view h1,
.markdown-doc-sheet .markdown-view h2,
.markdown-doc-sheet .markdown-view h3,
.markdown-doc-sheet .markdown-view h4,
.markdown-doc-sheet .markdown-view h5,
.markdown-doc-sheet .markdown-view h6 {
  color: var(--doc-primary);
  font-weight: 700;
  line-height: 1.25;
  margin: 6mm 0 2.5mm;
}

.markdown-doc-sheet .markdown-view h1 {
  font-size: 19pt;
  margin-top: 0;
}

.markdown-doc-sheet .markdown-view h2 {
  border-bottom: 1px solid var(--doc-line);
  font-size: 13pt;
  padding-bottom: 1.5mm;
}

.markdown-doc-sheet .markdown-view h3 { font-size: 11pt; }
.markdown-doc-sheet .markdown-view h4,
.markdown-doc-sheet .markdown-view h5,
.markdown-doc-sheet .markdown-view h6 { font-size: 10.5pt; }

.markdown-doc-sheet .markdown-view p { margin: 0 0 3mm; }

.markdown-doc-sheet .markdown-view ul,
.markdown-doc-sheet .markdown-view ol {
  margin: 0 0 3mm;
  padding-left: 6mm;
}

.markdown-doc-sheet .markdown-view li { margin: 1mm 0; }

.markdown-doc-sheet .markdown-view a {
  color: var(--doc-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.markdown-doc-sheet .markdown-view strong {
  color: var(--doc-primary-700);
  font-weight: 700;
}

.markdown-doc-sheet .markdown-view code {
  background: var(--doc-bg-soft);
  border-radius: 1mm;
  color: var(--doc-primary-700);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 9pt;
  padding: 0.2mm 1mm;
}

.markdown-doc-sheet .markdown-view pre {
  background: var(--doc-bg-soft);
  border: 1px solid var(--doc-line);
  border-radius: 1.5mm;
  margin: 0 0 3mm;
  overflow-x: auto;
  padding: 3mm 4mm;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.markdown-doc-sheet .markdown-view pre code {
  background: transparent;
  border: 0;
  font-size: 9pt;
  padding: 0;
}

.markdown-doc-sheet .markdown-view blockquote {
  background: var(--doc-bg-soft);
  border-left: 3px solid var(--doc-accent);
  color: var(--doc-muted);
  margin: 0 0 3mm;
  padding: 2mm 4mm;
}

.markdown-doc-sheet .markdown-view hr {
  border: 0;
  border-top: 1px solid var(--doc-line);
  margin: 5mm 0;
}

.markdown-doc-sheet .markdown-view table {
  border-collapse: collapse;
  display: table;
  margin: 0 0 3mm;
  width: 100%;
}

.markdown-doc-sheet .markdown-view th,
.markdown-doc-sheet .markdown-view td {
  border: 1px solid var(--doc-line);
  padding: 2mm 2.5mm;
  text-align: left;
  vertical-align: top;
}

.markdown-doc-sheet .markdown-view th {
  background: var(--doc-bg-soft);
  color: var(--doc-primary-700);
  font-weight: 700;
}

.markdown-doc-sheet .markdown-view img {
  border-radius: 1.5mm;
  height: auto;
  max-width: 100%;
}

@media print {
  @page { size: A4; margin: 16mm 15mm 18mm; }

  html,
  body { background: #ffffff !important; }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .markdown-doc-sheet {
    width: auto;
    max-width: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  .markdown-doc-sheet .markdown-view {
    font-size: 10.5pt;
    line-height: 1.55;
  }

  .markdown-doc-sheet .markdown-view a {
    color: var(--doc-primary);
    text-decoration: none;
  }

  .markdown-doc-sheet .markdown-view h1,
  .markdown-doc-sheet .markdown-view h2,
  .markdown-doc-sheet .markdown-view h3,
  .markdown-doc-sheet .markdown-view h4,
  .markdown-doc-sheet .markdown-view h5,
  .markdown-doc-sheet .markdown-view h6 {
    break-after: avoid;
    page-break-after: avoid;
  }

  .markdown-doc-sheet .markdown-view table,
  .markdown-doc-sheet .markdown-view pre,
  .markdown-doc-sheet .markdown-view blockquote,
  .markdown-doc-sheet .markdown-view img,
  .markdown-doc-sheet .markdown-view tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .markdown-doc-sheet .doc-header {
    break-after: avoid;
    page-break-after: avoid;
  }
}
`;
