import { z } from "zod";

export const packageSchema = z.object({
  name: z.string().min(3, { error: "O nome deve ter ao menos 3 caracteres." }).trim(),
  description: z.string().trim().optional().default(""),
  audience: z.string().trim().optional().default(""),
  recursos: z.array(z.string()).default([]),
  infraestrutura: z.array(z.string()).default([]),
});

export type PackageData = z.infer<typeof packageSchema>;

export type PackageActionResult =
  | { ok: true; packageId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
