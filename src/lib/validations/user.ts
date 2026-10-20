import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { error: "A senha deve ter ao menos 8 caracteres." })
  .regex(/[a-zA-Z]/, { error: "A senha deve conter ao menos uma letra." })
  .regex(/[0-9]/, { error: "A senha deve conter ao menos um número." });

export const createUserSchema = z.object({
  name: z.string().trim().min(2, { error: "O nome deve ter ao menos 2 caracteres." }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Informe um e-mail válido." })),
  password: passwordSchema,
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, { error: "O nome deve ter ao menos 2 caracteres." }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Informe um e-mail válido." })),
  password: z.union([z.literal(""), passwordSchema]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserActionResult =
  | { ok: true; user: { id: string; email: string; name: string | null } }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
