import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, { error: "Informe o nome do contratante." }).trim(),
  zipCode: z.string().trim().optional().default(""),
  street: z.string().trim().optional().default(""),
  number: z.string().trim().optional().default(""),
  complement: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  state: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || /^[A-Za-z]{2}$/.test(v), {
      error: "Informe o estado com 2 letras (UF).",
    }),
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

/**
 * Cliente selecionável no wizard. Carrega os dados que aparecem no documento
 * (documento, endereço e contato) para que o preview seja idêntico ao PDF.
 */
export type ClientOption = {
  id: string;
  name: string;
  clientCode?: string | null;
  document?: string | null;
  address?: string | null;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type ClientActionResult =
  | { ok: true; client: ClientOption }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
