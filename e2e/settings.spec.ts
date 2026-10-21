import "dotenv/config";
import { expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

test.describe("Configurações", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("aplica máscara de CNPJ e telefone e mantém os valores ao salvar", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard/configuracoes");

    const cnpj = page.getByLabel("CNPJ da empresa");
    const phone = page.getByLabel("Telefone");

    const originalCnpj = await cnpj.inputValue();
    const originalPhone = await phone.inputValue();

    try {
      await cnpj.fill("");
      await cnpj.type("12345678000199", { delay: 10 });
      await expect(cnpj).toHaveValue("12.345.678/0001-99");

      await phone.fill("");
      await phone.type("61987654321", { delay: 10 });
      await expect(phone).toHaveValue("(61) 98765-4321");

      await page.getByRole("button", { name: "Salvar configurações" }).click();
      await expect(page.getByText("Configurações salvas.")).toBeVisible();

      await page.reload();
      await expect(page.getByLabel("CNPJ da empresa")).toHaveValue("12.345.678/0001-99");
      await expect(page.getByLabel("Telefone")).toHaveValue("(61) 98765-4321");
    } finally {
      await page.getByLabel("CNPJ da empresa").fill(originalCnpj);
      await page.getByLabel("Telefone").fill(originalPhone);
      await page.getByRole("button", { name: "Salvar configurações" }).click();
      await expect(page.getByText("Configurações salvas.")).toBeVisible();
    }
  });
});
