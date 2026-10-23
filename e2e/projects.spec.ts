import "dotenv/config";
import { readFileSync } from "node:fs";

import { expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

test.describe("Projetos e documentos Markdown", () => {
  test.afterAll(async () => {
    await prisma.proposal.deleteMany({
      where: { title: { startsWith: "E2E Projeto " } },
    });
    await prisma.project.deleteMany({
      where: { name: { startsWith: "E2E Projeto" } },
    });
    await prisma.$disconnect();
  });

  test("cria projeto, anexa documento Markdown e exclui o projeto", async ({
    authedPage: page,
  }) => {
    const name = `E2E Projeto ${Date.now()}`;

    await page.goto("/dashboard/projetos");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Projetos");

    await page.getByRole("link", { name: "Novo projeto" }).click();
    await page.getByRole("textbox", { name: "Nome do projeto" }).fill(name);
    await page.getByLabel("Cliente").selectOption({ index: 1 });
    await page
      .getByRole("textbox", { name: "Breve descrição" })
      .fill("Projeto criado pelo teste end-to-end.");
    await page.getByRole("button", { name: "Criar projeto" }).click();

    await expect(page).toHaveURL(/\/dashboard\/projetos\/[^/]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(name);

    const projectUrl = page.url();
    await page.getByRole("link", { name: "Projetos", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/projetos$/);
    await page.getByRole("link", { name: "Novo projeto" }).click();
    await expect(page.getByRole("textbox", { name: "Nome do projeto" })).toHaveValue("");
    await expect(page.getByRole("textbox", { name: "Breve descrição" })).toHaveValue("");
    await expect(page.getByLabel("Cliente")).toHaveValue("");

    await page.goto(projectUrl);
    await page.getByRole("link", { name: "Novo documento" }).click();
    await page.getByRole("textbox", { name: "Título do documento" }).fill("Escopo do projeto");
    await page
      .getByRole("textbox", { name: "Conteúdo (Markdown)" })
      .fill("# Escopo\n\n- Credenciamento\n- Suporte técnico");

    await expect(page.getByRole("heading", { name: "Escopo", exact: true })).toBeVisible();
    await expect(page.locator(".markdown-view")).toContainText("Credenciamento");

    const editorBox = await page.locator("[data-document-editor]").boundingBox();
    const previewBox = await page.locator("[data-document-preview]").boundingBox();
    expect(editorBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(Math.abs((editorBox?.height ?? 0) - (previewBox?.height ?? 0))).toBeLessThanOrEqual(1);

    await page.getByRole("button", { name: "Anexar documento" }).click();

    await expect(page).toHaveURL(/\/dashboard\/projetos\/[^/]+$/);
    await expect(page.getByRole("table")).toContainText("Escopo do projeto");

    await page.getByRole("link", { name: "Visualizar" }).click();
    await expect(page).toHaveURL(/\/documentos\/[^/]+\/visualizar$/);
    await expect(page.getByRole("heading", { name: "Escopo", exact: true })).toBeVisible();
    await expect(page.locator(".markdown-view")).toContainText("Credenciamento");
    await expect(page.locator(".doc-header")).toContainText("Documento");
    await expect(page.locator(".doc-header")).toContainText("Escopo do projeto");
    await expect(page.getByRole("link", { name: "Baixar PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Baixar .md" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Imprimir" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Baixar .md" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("escopo-do-projeto.md");
    const downloadedPath = await download.path();
    expect(downloadedPath).not.toBeNull();
    expect(readFileSync(downloadedPath!, "utf8")).toContain("# Escopo");

    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".doc-header")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Baixar PDF" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Imprimir" })).toBeHidden();
    await page.emulateMedia({ media: "screen" });

    const match = page.url().match(/\/projetos\/([^/]+)\/documentos\/([^/]+)\/visualizar$/);
    expect(match).not.toBeNull();

    const pdfResponse = await page.request.get(
      `/api/projetos/${match?.[1]}/documentos/${match?.[2]}/pdf`,
    );
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");

    const pdfBody = await pdfResponse.body();
    expect(pdfBody.subarray(0, 5).toString()).toBe("%PDF-");

    await page.getByRole("link", { name: "Editar" }).click();
    await expect(page.getByRole("textbox", { name: "Conteúdo (Markdown)" })).toHaveValue(
      /# Escopo/,
    );
    await page.getByRole("textbox", { name: "Título do documento" }).fill("Escopo revisado");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.getByRole("table")).toContainText("Escopo revisado");

    const projectId = projectUrl.split("/").pop() as string;
    const proposalTitle = `E2E Projeto ${Date.now()}`;

    await page.goto("/dashboard/propostas/nova");
    await page.getByLabel("Título da proposta / evento").fill(proposalTitle);
    await page.getByLabel("Contratante").selectOption("seed-client-1");
    await page.getByLabel("Projeto vinculado").selectOption(projectId);
    await expect(page.getByRole("link", { name: "Abrir documentos do projeto" })).toBeVisible();

    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Próximo" }).click();
    }
    await page.getByLabel("Data / Período").first().fill("17/11/2026");
    await page.getByLabel("Data / Período").nth(1).fill("18/11/2026");
    await page.getByRole("button", { name: "Criar proposta" }).click();

    await expect(page).toHaveURL(/\/dashboard\/propostas\/(?!nova$)[^/]+$/);
    await expect(page.getByRole("link", { name: /Projeto vinculado/ })).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.locator("tr", { hasText: proposalTitle })).toContainText(name);

    await page.goto(projectUrl);
    await expect(page.getByRole("link", { name: proposalTitle })).toBeVisible();

    await page.goto("/dashboard/projetos");
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("tr", { hasText: name }).getByRole("button", { name: "Excluir" }).click();

    await expect.poll(() => prisma.project.count({ where: { name } })).toBe(0);
    await page.reload();
    await expect(page.getByRole("table")).not.toContainText(name);
  });
});
