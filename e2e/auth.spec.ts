import { DEMO_EMAIL, expect, login, test } from "./fixtures";

test.describe("Autenticação", () => {
  test("login válido leva ao dashboard", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Propostas");
  });

  test("credenciais inválidas exibem erro e não navegam", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(DEMO_EMAIL);
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("rota protegida sem sessão redireciona para o login", async ({ page }) => {
    await page.goto("/dashboard/propostas/seed-proposal-1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout encerra a sessão", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Menu do usuário" }).click();
    await page.getByRole("button", { name: /sair|logout|encerrar/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("cadastro público foi removido", async ({ page }) => {
    const response = await page.goto("/register");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Navegação principal", () => {
  test("links do header alcançam as seções do dashboard", async ({ authedPage: page }) => {
    await expect(page).toHaveURL(/\/dashboard$/);

    for (const [link, path] of [
      ["Clientes", "/dashboard/clientes"],
      ["Recursos", "/dashboard/recursos"],
      ["Pacotes", "/dashboard/pacotes"],
      ["Configurações", "/dashboard/configuracoes"],
    ] as const) {
      await page.getByRole("link", { name: link }).click();
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
    }
  });

  test("a lista mostra a proposta seed", async ({ authedPage: page }) => {
    await expect(page.locator("table")).toContainText("PR0001.0001");
    await expect(page.locator("table")).toContainText("Evento Lançamento");
  });
});
