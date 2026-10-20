import { z } from "zod";

const MAX_LOGO_BASE64 = 1_800_000;

export const settingsSchema = z.object({
  companyName: z.string().trim().min(1, { error: "Informe a empresa prestadora." }),
  tagline: z.string().trim().optional().default(""),
  responsible: z.string().trim().optional().default(""),
  responsibleRole: z.string().trim().optional().default(""),
  cnpj: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || /.+@.+\..+/.test(value), {
      error: "E-mail inválido.",
    }),
  logo: z
    .string()
    .nullable()
    .optional()
    .default(null)
    .refine(
      (value) => !value || (value.startsWith("data:image/") && value.length <= MAX_LOGO_BASE64),
      { error: "Logo inválida ou grande demais." },
    ),
});

export type SettingsData = z.infer<typeof settingsSchema>;

export type SettingsActionResult =
  { ok: true } | { ok: false; errors?: Record<string, string[]>; message?: string };
