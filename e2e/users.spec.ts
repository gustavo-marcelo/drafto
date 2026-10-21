import "dotenv/config";
import { expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

test.describe("Usuários", () => {
  test.afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: "e2e-user-" } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: "e2e-dup-" } } });
    await prisma.$disconnect();
  });

  test("página de usuários exige login", async ({ page }) => {
    await page.goto("/dashboard/usuarios");
    await expect(page).toHaveURL(/\/login/);
  });

  test("usuário logado cria um novo usuário e ele aparece na lista", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard/usuarios");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Usuários");

    const unique = Date.now();
    const email = `e2e-user-${unique}@destrava.ai`;

    await page.getByLabel("Nome").fill("Usuário E2E");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Telefone").fill("61987654321");
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
    await page.getByRole("button", { name: "Criar usuário" }).click();

    await expect(page.getByText(`Usuário ${email} criado.`)).toBeVisible();
    await expect(page.locator("table")).toContainText(email);

    const row = page.locator("tr", { hasText: email });
    await expect(row).toContainText("(61) 98765-4321");
  });

  test("rejeita e-mail duplicado", async ({ authedPage: page }) => {
    await page.goto("/dashboard/usuarios");

    const email = `e2e-dup-${Date.now()}@destrava.ai`;

    await page.getByLabel("Nome").fill("Duplicado");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
    await page.getByRole("button", { name: "Criar usuário" }).click();
    await expect(page.getByText(`Usuário ${email} criado.`)).toBeVisible();

    await page.getByLabel("Nome").fill("Duplicado 2");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
    await page.getByRole("button", { name: "Criar usuário" }).click();

    await expect(page.getByText("Já existe uma conta com este e-mail.")).toBeVisible();
  });

  test("edita o nome e o telefone de um usuário existente", async ({ authedPage: page }) => {
    await page.goto("/dashboard/usuarios");

    const email = `e2e-user-${Date.now()}@destrava.ai`;
    await page.getByLabel("Nome").fill("Nome Original");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura-123");
    await page.getByRole("button", { name: "Criar usuário" }).click();
    await expect(page.getByText(`Usuário ${email} criado.`)).toBeVisible();

    const row = page.locator("tr", { hasText: email });
    await row.getByRole("button", { name: "Editar" }).click();

    const nameInput = page.getByLabel("Nome");
    await expect(nameInput).toHaveValue("Nome Original");
    await nameInput.fill("Nome Editado");
    await page.getByLabel("Telefone").fill("11912345678");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.getByText(`Usuário ${email} atualizado.`)).toBeVisible();
    await expect(page.locator("tr", { hasText: email })).toContainText("Nome Editado");
    await expect(page.locator("tr", { hasText: email })).toContainText("(11) 91234-5678");
  });

  test("alterna a visibilidade da senha", async ({ authedPage: page }) => {
    await page.goto("/dashboard/usuarios");

    const password = page.getByLabel("Senha", { exact: true });
    await password.fill("senha-segura-123");
    await expect(password).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(password).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Ocultar senha" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });
});
