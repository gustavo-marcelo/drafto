import "dotenv/config";
import { expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

const RESOURCE_COUNT = 22;

test.describe("Paginação dinâmica do documento", () => {
  test.afterAll(async () => {
    await prisma.proposal.deleteMany({ where: { title: { startsWith: "E2E Paginação " } } });
    await prisma.$disconnect();
  });

  test("move a infraestrutura para a próxima página quando o catálogo não cabe", async ({
    page,
  }) => {
    const title = `E2E Paginação ${Date.now()}`;
    const shareId = `e2e${Date.now().toString(36)}`;

    await prisma.proposal.create({
      data: {
        title,
        shareId,
        solution:
          "Sistema de credenciamento com emissão de credenciais, controle de acesso e auditoria completa.",
        modules: {
          create: Array.from({ length: RESOURCE_COUNT }, (_, index) => ({
            key: `recurso-${index}`,
            title: `Recurso ${index + 1}`,
            description:
              "Emissão de credenciais com validação de documentação, consulta de histórico e integração.",
          })),
        },
        infrastructure: {
          create: Array.from({ length: 8 }, (_, index) => ({
            key: `infra-${index}`,
            title: `Infraestrutura ${index + 1}`,
            description: "Operação assistida com equipe dedicada durante todo o evento.",
          })),
        },
      },
    });

    await page.goto(`/p/${shareId}`);

    const pages = page.locator(".doc-page");
    await expect.poll(async () => pages.count(), { timeout: 20_000 }).toBeGreaterThan(3);

    const measurement = await page.evaluate(() => {
      const pageElements = Array.from(document.querySelectorAll(".doc-page"));
      const overflows: string[] = [];

      for (const pageElement of pageElements) {
        const footer = pageElement.querySelector(".doc-footer");
        const limit = footer
          ? footer.getBoundingClientRect().top
          : pageElement.getBoundingClientRect().bottom;

        for (const section of pageElement.querySelectorAll(".doc-section")) {
          const rect = section.getBoundingClientRect();
          if (rect.bottom > limit + 1) {
            const title = section.querySelector(".doc-section-title")?.textContent?.trim() ?? "";
            overflows.push(title);
          }
        }
      }

      return { pages: pageElements.length, overflows };
    });

    expect(measurement.pages).toBeGreaterThan(3);
    expect(measurement.overflows).toEqual([]);

    // A infraestrutura aparece inteira, em página própria do catálogo
    const infrastructure = page.locator('[data-doc-catalog="infrastructure"]');
    await expect(infrastructure).toHaveCount(1);
    await expect(infrastructure).toContainText("Infraestrutura 8");
  });
});
