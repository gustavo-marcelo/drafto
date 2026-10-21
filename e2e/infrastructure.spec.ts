import "dotenv/config";
import { SEED_SHARE_ID, expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

test.describe("Infraestrutura e operação", () => {
  test.afterAll(async () => {
    await prisma.infrastructure.deleteMany({
      where: { key: { startsWith: "e2e-infraestrutura-" } },
    });
    await prisma.$disconnect();
  });

  test("página exige login", async ({ page }) => {
    await page.goto("/dashboard/infraestrutura");
    await expect(page).toHaveURL(/\/login/);
  });

  test("cria, edita e exclui um item do catálogo", async ({ authedPage: page }) => {
    await page.goto("/dashboard/infraestrutura");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Infraestrutura e operação",
    );

    await page.getByRole("link", { name: "Novo item" }).click();
    const title = `E2E Infraestrutura ${Date.now()}`;
    await page.getByRole("textbox", { name: "Título do item" }).fill(title);
    await page
      .getByRole("textbox", { name: "Descrição" })
      .fill("Item criado pelo teste end-to-end.");
    await page.getByRole("button", { name: "Criar item" }).click();

    await expect(page).toHaveURL(/\/dashboard\/infraestrutura$/);
    await expect(page.locator("table")).toContainText(title);

    const row = page.locator("tr", { hasText: title });
    await row.getByRole("link", { name: "Editar" }).click();

    const titulo = page.getByRole("textbox", { name: "Título do item" });
    await expect(titulo).toHaveValue(title);
    await titulo.fill(`${title} editado`);
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.locator("table")).toContainText(`${title} editado`);

    page.once("dialog", (dialog) => dialog.accept());
    await page
      .locator("tr", { hasText: `${title} editado` })
      .getByRole("button", { name: "Excluir" })
      .click();

    await expect(page.locator("table")).not.toContainText(`${title} editado`);
  });

  test("a proposta pública exibe a seção de infraestrutura na página 1", async ({ page }) => {
    await page.goto(`/p/${SEED_SHARE_ID}`);
    await expect(page.getByRole("heading", { name: "Infraestrutura e operação" })).toBeVisible();
  });

  test("o item do catálogo aparece na seleção do wizard e na pré-visualização", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard/propostas/nova");
    await page
      .getByRole("textbox", { name: "Título da proposta / evento" })
      .fill("E2E Infraestrutura preview");
    await page.getByRole("button", { name: "Próximo" }).click();

    await page.getByRole("checkbox", { name: "Totens de autoatendimento" }).check();

    await expect(page.locator(".doc-preview-frame")).toContainText("Totens de autoatendimento");
  });
});
