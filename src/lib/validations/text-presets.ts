import { z } from "zod";

export const TEXT_PRESET_CATEGORIES = [
  "solution",
  "requirements",
  "disclaimer",
  "acceptanceNote",
  "includedCosts",
] as const;

export type TextPresetCategory = (typeof TEXT_PRESET_CATEGORIES)[number];

export type TextPresetItem = {
  id: string;
  category: TextPresetCategory;
  title: string;
  content: string;
};

export const textPresetSchema = z.object({
  category: z.enum(TEXT_PRESET_CATEGORIES, { error: "Categoria inválida." }),
  title: z
    .string()
    .trim()
    .min(1, { error: "Informe um nome para o texto." })
    .max(80, { error: "Nome muito longo (máx. 80 caracteres)." }),
  content: z
    .string()
    .trim()
    .min(1, { error: "O texto não pode ficar vazio." })
    .max(10_000, { error: "Texto muito longo (máx. 10.000 caracteres)." }),
});

export type TextPresetData = z.infer<typeof textPresetSchema>;

export type TextPresetActionResult =
  | { ok: true; item: TextPresetItem }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
