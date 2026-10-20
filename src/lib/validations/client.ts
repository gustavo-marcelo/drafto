import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, { error: "Informe o nome do contratante." }).trim(),
  address: z.string().trim().optional().default(""),
  document: z.string().trim().optional().default(""),
  contact: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      error: "Informe um e-mail válido.",
    }),
  clientCode: z.string().trim().optional().default(""),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientOption = { id: string; name: string; clientCode?: string | null };

export type ClientActionResult =
  | { ok: true; client: ClientOption }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
