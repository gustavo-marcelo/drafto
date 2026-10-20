import { describe, expect, it } from "vitest";

import { logger } from "@/lib/logger";

describe("logger", () => {
  it("expõe os níveis esperados", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("registra sem lançar", () => {
    expect(() => logger.info({ proposalId: "abc" }, "teste")).not.toThrow();
    expect(() => logger.error({ err: new Error("x") }, "falha")).not.toThrow();
  });
});
