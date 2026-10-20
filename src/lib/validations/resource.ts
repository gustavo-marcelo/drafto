import { z } from "zod";

export const resourceSchema = z.object({
  title: z.string().min(3, { error: "O título deve ter ao menos 3 caracteres." }).trim(),
  description: z.string().trim().optional().default(""),
  position: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean().default(true),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

export type ResourceActionResult =
  | { ok: true; resourceId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
