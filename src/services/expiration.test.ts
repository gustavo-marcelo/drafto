import { beforeEach, describe, expect, it, vi } from "vitest";

const updateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { proposal: { updateMany } },
}));

const { expireOverdueProposals } = await import("@/services/expiration");

describe("expireOverdueProposals", () => {
  beforeEach(() => {
    updateMany.mockReset();
    updateMany.mockResolvedValue({ count: 0 });
  });

  it("marca como EXPIRED apenas propostas SENT com validUntil anterior a hoje", async () => {
    await expireOverdueProposals();

    expect(updateMany).toHaveBeenCalledTimes(1);
    const call = updateMany.mock.calls[0][0];
    expect(call.where.status).toBe("SENT");
    expect(call.data).toEqual({ status: "EXPIRED" });
    expect(call.where.validUntil.lt).toBeInstanceOf(Date);
  });

  it("usa a meia-noite de hoje como limite (não expira o que vence hoje)", async () => {
    await expireOverdueProposals();

    const limit: Date = updateMany.mock.calls[0][0].where.validUntil.lt;
    expect(limit.getHours()).toBe(0);
    expect(limit.getMinutes()).toBe(0);
    expect(limit.getSeconds()).toBe(0);
    expect(limit.getMilliseconds()).toBe(0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    expect(limit.getTime()).toBe(startOfToday.getTime());
  });

  it("retorna a quantidade de propostas afetadas", async () => {
    updateMany.mockResolvedValue({ count: 3 });
    await expect(expireOverdueProposals()).resolves.toBe(3);
  });

  it("retorna zero quando nada expira", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    await expect(expireOverdueProposals()).resolves.toBe(0);
  });
});
