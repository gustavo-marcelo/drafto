import "dotenv/config";
import { SEED_PROPOSAL_CODE, SEED_SHARE_ID, expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

test.describe("Criar proposta (fluxo crítico)", () => {
  test.afterAll(async () => {
    await prisma.proposal.deleteMany({ where: { title: { startsWith: "E2E Proposta " } } });
    await prisma.$disconnect();
  });

  test("preenche o wizard, salva e gera o PDF", async ({ authedPage: page }) => {
    await page.goto("/dashboard/propostas/nova");
    await expect(page.getByRole("heading", { name: "Nova proposta" })).toBeVisible();

    // Etapa 1 — dados do evento
    const title = `E2E Proposta ${Date.now()}`;
    await page.getByLabel("Título da proposta / evento").fill(title);
    await page.getByRole("button", { name: "Próximo" }).click();

    // Etapa 2 — solução
    await page.locator("#solution").fill("Solução de credenciamento automatizado.");

    // Etapa 3 — valores
    await page.getByRole("button", { name: "Próximo" }).click();

    // Etapa 4 — cronograma + criação
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByLabel("Data / Período").first().fill("17/11/2026");
    await page.getByLabel("Data / Período").nth(1).fill("18/11/2026");
    await page.getByRole("button", { name: "Criar proposta" }).click();

    // Confirma a criação e o redirect para a edição (id real, não "nova")
    await expect(page).toHaveURL(/\/dashboard\/propostas\/(?!nova$)[^/]+$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();

    const proposalId = page.url().split("/").pop() as string;
    expect(proposalId).not.toBe("nova");

    // Aguarda a hidratação do wizard de edição e salva percorrendo as etapas
    for (let i = 0; i < 3; i++) {
      const next = page.getByRole("button", { name: "Próximo" });
      await expect(next).toBeVisible();
      await next.click();
    }
    const saveButton = page.getByRole("button", { name: "Salvar alterações" });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.getByText("Proposta salva.")).toBeVisible({ timeout: 20_000 });

    // Código gerado aparece na lista
    await page.goto("/dashboard");
    await expect(page.locator("table")).toContainText(title);

    // PDF autenticado responde como anexo PDF
    const response = await page.request.get(`/api/propostas/${proposalId}/pdf`);
    expect(response.status(), `PDF status para ${proposalId}`).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect(response.headers()["content-disposition"]).toContain("attachment");
    const body = await response.body();
    expect(body.subarray(0, 4).toString()).toBe("%PDF");
  });
});

test.describe("Duplicar proposta", () => {
  test("a cópia mantém as ações de link público", async ({ authedPage: page }) => {
    await page.goto("/dashboard");

    const row = page.locator("tbody tr", { hasText: SEED_PROPOSAL_CODE });
    await row.getByRole("button", { name: "Duplicar" }).click();

    await expect(page).toHaveURL(/\/dashboard\/propostas\/(?!seed-proposal-1)[^/]+$/, {
      timeout: 20_000,
    });
    await expect(page.getByRole("link", { name: "Abrir link público" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copiar link" })).toBeVisible();

    const copyId = page.url().split("/").pop() as string;
    const copy = await prisma.proposal.findUnique({ where: { id: copyId } });
    expect(copy?.shareId, "a cópia deve ter shareId").toBeTruthy();

    await prisma.proposal.delete({ where: { id: copyId } });
  });
});

test.describe("PDF da proposta seed", () => {
  test("a proposta seed tem código e link público válidos", async ({ authedPage: page }) => {
    await expect(page.locator("table")).toContainText(SEED_PROPOSAL_CODE);

    const response = await page.request.get(`/api/propostas/publicas/${SEED_SHARE_ID}/pdf`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/pdf");
    const body = await response.body();
    expect(body.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("a página pública renderiza a proposta sem login", async ({ page }) => {
    await page.goto(`/p/${SEED_SHARE_ID}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Evento Lançamento");
  });
});

test.describe("Hierarquia de títulos do documento", () => {
  test("o preview do wizard usa h2 e a página mantém um único h1", async ({ authedPage: page }) => {
    await page.goto("/dashboard/propostas/nova");
    await expect(page.getByRole("heading", { level: 1, name: "Nova proposta" })).toBeVisible();

    const title = `E2E Títulos ${Date.now()}`;
    await page.getByLabel("Título da proposta / evento").fill(title);

    const preview = page.locator(".doc-preview-scale");
    await expect(preview.locator("h2.doc-title")).toContainText(title);
    await expect(preview.locator("h1")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("a página pública mantém o título do documento como h1", async ({ page }) => {
    await page.goto(`/p/${SEED_SHARE_ID}`);

    await expect(page.locator("h1.doc-title")).toHaveCount(1);
    await expect(page.locator("h1.doc-title")).toContainText("Evento Lançamento");
  });
});
