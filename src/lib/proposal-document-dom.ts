/**
 * Contrato DOM entre o render do documento (`ProposalDocumentView`) e o solver
 * de paginação (`computeDocumentLayout`).
 *
 * As classes `doc-*` cuidam apenas do visual: o solver consulta somente os
 * atributos abaixo. Como `computeDocumentLayout` é serializada para dentro do
 * browser pelo Puppeteer (não pode depender do módulo), os seletores chegam
 * por argumento e a origem da verdade é este arquivo.
 */
export const DOC_PAGE_ATTRIBUTE = "data-doc-page";
export const DOC_FOOTER_ATTRIBUTE = "data-doc-footer";
export const DOC_BLOCK_ATTRIBUTE = "data-doc-block";
export const DOC_ITEM_ATTRIBUTE = "data-doc-item";

export type DocumentSelectors = {
  /** Selector das páginas do documento. */
  page: string;
  /** Selector do rodapé (limite inferior do conteúdo). */
  footer: string;
  /** Selector dos blocos de conteúdo. */
  block: string;
  /** Selector dos itens dentro de um bloco. */
  item: string;
  /** Atributo que identifica o tipo do bloco. */
  blockAttribute: string;
};

export const DOC_SELECTORS: DocumentSelectors = {
  page: `[${DOC_PAGE_ATTRIBUTE}]`,
  footer: `[${DOC_FOOTER_ATTRIBUTE}]`,
  block: `[${DOC_BLOCK_ATTRIBUTE}]`,
  item: `[${DOC_ITEM_ATTRIBUTE}]`,
  blockAttribute: DOC_BLOCK_ATTRIBUTE,
};
