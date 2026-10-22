import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2, { error: "Informe o nome do projeto." }).trim(),
  description: z.string().min(3, { error: "Informe uma breve descrição do projeto." }).trim(),
  clientId: z.string().min(1, { error: "Selecione o cliente do projeto." }),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectDocumentSchema = z.object({
  title: z.string().min(2, { error: "Informe o título do documento." }).trim(),
  content: z.string().min(1, { error: "Informe o conteúdo Markdown do documento." }),
});

export type ProjectDocumentInput = z.infer<typeof projectDocumentSchema>;

export type ProjectActionResult =
  | { ok: true; projectId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };

export type ProjectDocumentActionResult =
  | { ok: true; documentId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
