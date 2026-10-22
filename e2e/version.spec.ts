import { expect, test } from "./fixtures";

test.describe("Versão da aplicação", () => {
  test("a API informa o commit e o build em execução", async ({ request }) => {
    const response = await request.get("/api/version");

    expect(response.ok()).toBe(true);

    const body = await response.json();

    expect(body.version).toBeTruthy();
    expect(body.buildId).toBeTruthy();
    expect(body.startedAt).toBeTruthy();
    expect(body.node).toMatch(/^v\d+/);
  });
});
