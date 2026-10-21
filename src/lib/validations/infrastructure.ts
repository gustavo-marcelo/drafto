import { z } from "zod";

export const infrastructureSchema = z.object({
  title: z.string().min(3, { error: "O título deve ter ao menos 3 caracteres." }).trim(),
  description: z.string().trim().optional().default(""),
  position: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean().default(true),
});

export type InfrastructureInput = z.infer<typeof infrastructureSchema>;

export type InfrastructureActionResult =
  | { ok: true; infrastructureId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
