/**
 * Versão da aplicação injetada no build.
 *
 * `NEXT_PUBLIC_APP_COMMIT` é definido em `next.config.ts` a partir do commit
 * do Git no momento do build e fica embutido nos bundles (servidor e cliente),
 * então mostra exatamente qual código está no ar.
 */

export const APP_COMMIT = process.env.NEXT_PUBLIC_APP_COMMIT || "sem-commit";

/** Rótulo curto exibido no rodapé do documento (ex.: `v a7c1d64`). */
export const APP_VERSION_LABEL = `v ${APP_COMMIT}`;
