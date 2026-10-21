import "dotenv/config";
import { expect, test } from "./fixtures";
import { prisma } from "../src/lib/prisma";

const RESOURCE_COUNT = 22;

test.describe("Paginação dinâmica do documento", () => {
  test.afterAll(async () => {
    await prisma.proposal.deleteMany({ where: { title: { startsWith: "E2E Paginação " } } });
    await prisma.$disconnect();
  });

  test("move o conteúdo para as páginas seguintes sem cortar seções", async ({ page }) => {
    const title = `E2E Paginação ${Date.now()}`;
    const shareId = `e2e${Date.now().toString(36)}`;

    await prisma.proposal.create({
      data: {
        title,
        shareId,
        solution:
          "Sistema de credenciamento com emissão de credenciais, controle de acesso e auditoria completa.",
        payload: {
          requirements: "Montagem e operação dos totens no local do evento.",
          disclaimer: "Os avisos contratuais são apresentados na sequência do documento.",
        },
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
        schedule: {
          create: Array.from({ length: 6 }, (_, index) => ({
            date: `0${index + 1}/11/2026`,
            title: `Marco ${index + 1}`,
            description: "Descrição do marco operacional.",
            position: index,
          })),
        },
      },
    });

    await page.goto(`/p/${shareId}`);

    const pages = page.locator(".doc-page");
    await expect.poll(async () => pages.count(), { timeout: 20_000 }).toBeGreaterThan(2);

    const measurement = await page.evaluate(() => {
      const pageElements = Array.from(document.querySelectorAll(".doc-page"));
      const overflows: string[] = [];
      const order: string[] = [];

      for (const pageElement of pageElements) {
        const footer = pageElement.querySelector(".doc-footer");
        const limit = footer
          ? footer.getBoundingClientRect().top
          : pageElement.getBoundingClientRect().bottom;

        for (const section of pageElement.querySelectorAll("[data-doc-block]")) {
          const rect = section.getBoundingClientRect();
          order.push(section.getAttribute("data-doc-block") ?? "");
          if (rect.bottom > limit + 1) {
            overflows.push(section.getAttribute("data-doc-block") ?? "");
          }
        }
      }

      const valuesBlock = document.querySelector('[data-doc-block="values"]');
      const valuesPage = valuesBlock?.closest(".doc-page");
      const valuesTitle = valuesBlock?.querySelector(".doc-section-title")?.textContent?.trim();

      return {
        pages: pageElements.length,
        overflows,
        order,
        valuesTitle,
        valuesStartsPage: valuesPage?.querySelectorAll("[data-doc-block]").length === 1,
      };
    });

    expect(measurement.pages).toBeGreaterThan(2);
    expect(measurement.overflows).toEqual([]);

    // Os itens de operação ficam na sequência, sem uma página reservada só para eles
    expect(measurement.order).toContain("requirements");
    expect(measurement.order).toContain("schedule");
    expect(measurement.order).toContain("disclaimer");
    expect(measurement.order.indexOf("resources")).toBeLessThan(
      measurement.order.indexOf("requirements"),
    );
    expect(measurement.order.indexOf("requirements")).toBeLessThan(
      measurement.order.indexOf("schedule"),
    );
    expect(measurement.order.indexOf("schedule")).toBeLessThan(
      measurement.order.indexOf("disclaimer"),
    );

    // A página de valores começa com as condições comerciais
    expect(measurement.valuesTitle).toBe("Condições comerciais");
    expect(measurement.valuesStartsPage).toBe(true);

    // A infraestrutura aparece inteira
    await expect(page.locator('[data-doc-block="infrastructure"]')).toHaveCount(1);
    await expect(page.locator('[data-doc-block="infrastructure"]')).toContainText(
      "Infraestrutura 8",
    );
  });
});
