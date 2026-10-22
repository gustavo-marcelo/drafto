import path from "node:path";

import { expect, test } from "./fixtures";

const AXE_PATH = path.join(process.cwd(), "node_modules/axe-core/axe.min.js");

test.describe("Landing page", () => {
  test("apresenta o produto e oferece acesso ao login", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Propostas comerciais prontas para enviar",
    );

    const cta = page.getByRole("link", { name: "Entrar no sistema" }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/login");

    await cta.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("navega pelas seções da página", async ({ page }) => {
    await page.goto("/");

    for (const anchor of ["#recursos", "#como-funciona", "#documento", "#duvidas"]) {
      await expect(page.locator(anchor)).toBeVisible();
    }

    await page.getByRole("link", { name: "Recursos" }).first().click();
    await expect(page).toHaveURL(/#recursos/);
    await expect(
      page.getByRole("heading", { name: /Tudo o que a proposta precisa/ }),
    ).toBeVisible();
  });

  test("não exibe a versão do build", async ({ page }) => {
    await page.goto("/");

    const content = await page.content();
    expect(content).not.toMatch(/Versão\s+[0-9a-f]{7,}/i);
  });

  test("menu mobile abre as seções", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Abrir menu" });
    await expect(toggle).toBeVisible();
    await toggle.click();

    const menu = page.getByRole("navigation", { name: "Navegação mobile" });
    await expect(menu.getByRole("link", { name: "Recursos" })).toBeVisible();

    await menu.getByRole("link", { name: "Como funciona" }).click();
    await expect(page).toHaveURL(/#como-funciona/);
    await expect(page.getByRole("button", { name: "Fechar menu" })).toBeHidden();
  });

  test("atende os requisitos de acessibilidade", async ({ page }) => {
    await page.goto("/");
    await page.addScriptTag({ path: AXE_PATH });

    const violations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: () => Promise<{ violations: unknown[] }> } })
        .axe;
      const results = await axe.run();
      return results.violations.map((violation) => ({
        id: (violation as { id: string }).id,
        impact: (violation as { impact: string }).impact,
        nodes: (violation as { nodes: { target: string[] }[] }).nodes.map((node) => node.target),
      }));
    });

    expect(violations).toEqual([]);
  });
});
