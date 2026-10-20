import { test as base, expect, type Page } from "@playwright/test";

export const DEMO_EMAIL = "demo@destrava.ai";
export const DEMO_PASSWORD = "proposta123";
export const SEED_PROPOSAL_CODE = "PR0001.0001";
export const SEED_SHARE_ID = "demo1234abcd5678";

export async function login(page: Page, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, provide) => {
    await login(page);
    await provide(page);
  },
});

export { expect };
