import { z } from "zod";

export const packageEquipmentSchema = z.object({
  name: z.string().min(1, { error: "Informe o nome do equipamento." }).trim(),
  description: z.string().trim().optional().default(""),
  quantity: z.coerce.number().int().min(1, { error: "Quantidade mínima é 1." }),
  specs: z.string().trim().optional().default(""),
});

export const packageSchema = z.object({
  name: z.string().min(3, { error: "O nome deve ter ao menos 3 caracteres." }).trim(),
  description: z.string().trim().optional().default(""),
  audience: z.string().trim().optional().default(""),
  recursos: z.array(z.string()).default([]),
  equipamentos: z.array(packageEquipmentSchema).default([]),
});

export type PackageEquipment = z.infer<typeof packageEquipmentSchema>;
export type PackageData = z.infer<typeof packageSchema>;

export type PackageActionResult =
  | { ok: true; packageId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
