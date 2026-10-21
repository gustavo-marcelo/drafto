import "dotenv/config";
import { expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

test.describe("Composição do valor", () => {
  test.afterAll(async () => {
    await prisma.proposal.deleteMany({ where: { title: { startsWith: "E2E Composição " } } });
    await prisma.$disconnect();
  });

  test("detalha o total em itens e ajusta o valor total da proposta", async ({
    authedPage: page,
  }) => {
    const title = `E2E Composição ${Date.now()}`;

    await page.goto("/dashboard/propostas/nova");
    await page.getByLabel("Título da proposta / evento").fill(title);
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByRole("button", { name: "Próximo" }).click();

    await expect(page.getByRole("heading", { name: "Composição do valor" })).toBeVisible();

    // Sem itens, o valor total é digitado livremente
    const total = page.getByLabel("Valor total (R$)");
    await total.fill("5000");
    await expect(total).toHaveValue("5000");

    // Com itens, o valor total passa a ser calculado
    await page.getByRole("button", { name: "+ Adicionar item" }).click();
    await expect(total).toHaveAttribute("readonly", "");

    await page.locator("#value-item-0-description").fill("Licença, configuração e painel");
    await page.locator("#value-item-0-quantity").fill("2");
    await page.locator("#value-item-0-unitValue").fill("1500");
    await expect(total).toHaveValue("3000");

    await page.getByRole("button", { name: "+ Adicionar item" }).click();
    await page.locator("#value-item-1-description").fill("Suporte técnico presencial");
    await page.locator("#value-item-1-unitValue").fill("1000");
    await expect(total).toHaveValue("4000");

    // O documento mostra a composição
    await expect(page.locator(".doc-preview-frame")).toContainText("Composição do valor");
    await expect(page.locator(".doc-preview-frame")).toContainText(
      "Licença, configuração e painel",
    );

    // Salva e confere no banco
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByLabel("Data / Período").first().fill("17/11/2026");
    await page.getByLabel("Data / Período").nth(1).fill("18/11/2026");
    await page.getByRole("button", { name: "Criar proposta" }).click();
    await expect(page).toHaveURL(/\/dashboard\/propostas\/(?!nova$)[^/]+$/, { timeout: 20_000 });

    const proposal = await prisma.proposal.findFirst({
      where: { title },
      include: { valueItems: { orderBy: { position: "asc" } } },
    });

    expect(proposal).not.toBeNull();
    expect(proposal?.totalAmount?.toNumber()).toBe(4000);
    expect(proposal?.valueItems).toHaveLength(2);
    expect(proposal?.valueItems[0].description).toBe("Licença, configuração e painel");
    expect(proposal?.valueItems[0].quantity).toBe(2);
    expect(proposal?.valueItems[0].unitValue.toNumber()).toBe(1500);
    expect(proposal?.valueItems[1].description).toBe("Suporte técnico presencial");
    expect(proposal?.valueItems[1].quantity).toBe(1);
    expect(proposal?.valueItems[1].unitValue.toNumber()).toBe(1000);
  });
});
