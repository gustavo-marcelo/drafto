export const PROPOSAL_DOCUMENT_CSS = `
  :root {
    --doc-primary: #123b36;
    --doc-primary-700: #002824;
    --doc-accent: #c7a66b;
    --doc-accent-700: #aa8c55;
    --doc-ink: #1c2b28;
    --doc-muted: #5b6b67;
    --doc-line: #d7e0dd;
    --doc-bg-soft: #f3f7f6;
  }

  * { box-sizing: border-box; }

  body.doc-body {
    margin: 0;
    padding: 0;
    background: #e9eeed;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: var(--doc-ink);
    -webkit-font-smoothing: antialiased;
  }

  .doc-page {
    position: relative;
    width: 210mm;
    height: 297mm;
    margin: 0 auto;
    padding: 18mm 16mm 20mm 16mm;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* O conteúdo excedente deve transbordar (e ser cortado) em vez de encolher:
     assim a medição de overflow no browser continua válida. */
  .doc-page > * { flex-shrink: 0; }

  .doc-page + .doc-page { margin-top: 8mm; }

  @media print {
    body.doc-body { background: #ffffff; }
    .doc-page,
    .doc-page + .doc-page {
      margin: 0;
      box-shadow: none;
    }
    .doc-page {
      page-break-after: always;
      break-after: page;
    }
    .doc-page:last-child { page-break-after: auto; break-after: auto; }
  }

  @page { size: A4; margin: 0; }

  .doc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 4mm;
    border-bottom: 2px solid var(--doc-primary);
    margin-bottom: 6mm;
  }

  .doc-brand { display: flex; align-items: center; gap: 3mm; }

  .doc-logo {
    width: 11mm;
    height: 11mm;
    border-radius: 2mm;
    background: var(--doc-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13pt;
    letter-spacing: -0.5px;
  }

  .doc-brand-name {
    font-size: 13pt;
    font-weight: 700;
    color: var(--doc-primary);
    line-height: 1.1;
  }

  .doc-brand-tag {
    font-size: 7.5pt;
    color: var(--doc-muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .doc-logo-img {
    width: 11mm;
    height: 11mm;
    border-radius: 2mm;
    object-fit: contain;
  }

  .doc-header-meta { text-align: right; font-size: 8pt; color: var(--doc-muted); }
  .doc-header-meta strong { color: var(--doc-primary); font-size: 9pt; }

  .doc-footer {
    position: absolute;
    left: 16mm;
    right: 16mm;
    bottom: 10mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 3mm;
    border-top: 1px solid var(--doc-line);
    font-size: 7.5pt;
    color: var(--doc-muted);
  }

  .doc-footer .doc-page-number {
    font-weight: 700;
    color: var(--doc-primary);
  }

  .doc-footer-contact { color: var(--doc-muted); }
  .doc-footer-version { color: var(--doc-muted); }

  .doc-section { margin-bottom: 5mm; }
  .doc-section:last-child { margin-bottom: 0; }

  .doc-section-title {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--doc-primary);
    margin: 0 0 2.5mm 0;
    padding-bottom: 1.5mm;
    border-bottom: 1px solid var(--doc-line);
  }

  .doc-hero { margin-bottom: 5mm; }
  .doc-hero h1 {
    font-size: 19pt;
    line-height: 1.15;
    color: var(--doc-primary);
    margin: 0 0 1.5mm 0;
    font-weight: 700;
  }
  .doc-hero .doc-subtitle {
    font-size: 10.5pt;
    color: var(--doc-muted);
    margin: 0;
    font-style: italic;
  }

  .doc-grid { display: grid; gap: 3mm; }
  .doc-grid-2 { grid-template-columns: 1fr 1fr; }
  .doc-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

  .doc-field-label {
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--doc-muted);
    margin-bottom: 0.8mm;
  }
  .doc-field-value { font-size: 10pt; color: var(--doc-ink); font-weight: 500; }

  .doc-text { font-size: 9.5pt; line-height: 1.55; color: var(--doc-ink); margin: 0; }

  .doc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    column-count: 2;
    column-gap: 6mm;
  }
  .doc-list li {
    display: block;
    padding: 1.8mm 0;
    font-size: 9.5pt;
    line-height: 1.4;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .doc-item-title { font-weight: 600; color: var(--doc-primary-700); }
  .doc-item-desc { color: var(--doc-muted); font-size: 8.5pt; }

  .doc-schedule-row {
    display: grid;
    grid-template-columns: 34mm 1fr;
    gap: 3mm;
    padding: 2.2mm 0;
    border-bottom: 1px solid var(--doc-line);
  }
  .doc-schedule-row:last-child { border-bottom: none; }
  .doc-schedule-date {
    font-size: 9.5pt;
    font-weight: 700;
    color: var(--doc-primary);
    white-space: nowrap;
  }

  .doc-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  .doc-table th {
    text-align: left;
    background: var(--doc-bg-soft);
    color: var(--doc-primary);
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    padding: 2.2mm 3mm;
    border-bottom: 1px solid var(--doc-line);
  }
  .doc-table td {
    padding: 2.2mm 3mm;
    border-bottom: 1px solid var(--doc-line);
    color: var(--doc-ink);
  }
  .doc-table .doc-amount { text-align: right; font-weight: 600; white-space: nowrap; }
  .doc-table tr.doc-total td {
    background: var(--doc-bg-soft);
    color: var(--doc-primary);
    font-weight: 700;
    font-size: 10pt;
    border-top: 1px solid var(--doc-line);
    border-bottom: none;
  }
  .doc-table tr.doc-total .doc-amount { text-align: right; }

  .doc-note {
    background: var(--doc-bg-soft);
    border-left: 3px solid var(--doc-accent);
    padding: 3mm 4mm;
    font-size: 9pt;
    line-height: 1.5;
    color: var(--doc-ink);
    border-radius: 0 1.5mm 1.5mm 0;
  }

  .doc-terms { list-style: none; margin: 0; padding: 0; }
  .doc-terms li {
    font-size: 9pt;
    line-height: 1.5;
    padding: 1.2mm 0;
    color: var(--doc-ink);
    display: flex;
    gap: 2mm;
  }
  .doc-terms li::before { content: "•"; color: var(--doc-accent-700); font-weight: 700; }

  .doc-signature { margin-top: 8mm; display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
  .doc-signature-line { border-top: 1px solid var(--doc-ink); padding-top: 2mm; }
  .doc-signature-line .doc-signature-role { font-size: 8.5pt; color: var(--doc-muted); }
  .doc-signature-line .doc-signature-name { font-size: 9pt; color: var(--doc-ink); margin-bottom: 8mm; }

  .doc-public-shell { padding-bottom: 10mm; }
  .doc-public-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3mm 16mm;
    background: var(--doc-primary);
    color: #fff;
  }
  .doc-public-bar-title { font-size: 9pt; font-weight: 600; letter-spacing: 0.3px; }
  .doc-public-print {
    background: var(--doc-accent);
    color: var(--doc-primary);
    font-size: 8.5pt;
    font-weight: 700;
    padding: 1.8mm 4mm;
    border-radius: 1.5mm;
    text-decoration: none;
  }

  .doc-preview-scroll {
    max-height: 72vh;
    overflow: auto;
    padding: 6mm;
    background: #e9eeed;
  }
  .doc-preview-frame {
    width: calc(210mm * 0.42);
    height: calc((297mm * 3 + 16mm) * 0.42);
    overflow: hidden;
    margin: 0 auto;
  }
  .doc-preview-scale {
    transform: scale(0.42);
    transform-origin: top left;
    width: 210mm;
  }
  .doc-preview-scale .doc-page {
    box-shadow: 0 2px 12px rgba(18, 59, 54, 0.14);
  }
  .doc-preview-scale .doc-page + .doc-page { margin-top: 8mm; }
`;
