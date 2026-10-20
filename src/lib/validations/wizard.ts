import { z } from "zod";

export const wizardModuleSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
});

export const wizardEquipmentSchema = z.object({
  name: z.string().min(1, { error: "Informe o nome do equipamento." }).trim(),
  description: z.string().trim().optional().default(""),
  quantity: z.coerce.number().int().min(1, { error: "Quantidade mínima é 1." }),
  specs: z.string().trim().optional().default(""),
});

export const wizardPaymentSchema = z.object({
  dueDate: z.string().min(1, { error: "Informe a data de vencimento." }),
  amount: z.coerce.number().min(0, { error: "Valor inválido." }),
});

export const wizardScheduleSchema = z.object({
  date: z.string().min(1, { error: "Informe a data." }),
  title: z.string().min(3, { error: "O título deve ter ao menos 3 caracteres." }).trim(),
  description: z.string().trim().optional().default(""),
});

export const wizardStep1Schema = z.object({
  title: z.string().min(3, { error: "O título deve ter ao menos 3 caracteres." }).trim(),
  subtitle: z.string().trim().optional().default(""),
  eventDate: z.string().trim().optional().default(""),
  issuedAt: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  audience: z.string().trim().optional().default(""),
  clientId: z.string().trim().optional().default(""),
});

export const wizardStep2Schema = z.object({
  solution: z.string().trim().optional().default(""),
  modules: z.array(wizardModuleSchema).default([]),
  equipment: z.array(wizardEquipmentSchema).default([]),
});

export const wizardStep3Schema = z.object({
  packageId: z.string().trim().optional().default(""),
  totalAmount: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().trim().optional().default(""),
  validUntil: z.string().trim().optional().default(""),
  includedCosts: z.string().trim().optional().default(""),
  payments: z.array(wizardPaymentSchema).default([]),
});

export const wizardStep4Schema = z.object({
  requirements: z.string().trim().optional().default(""),
  disclaimer: z.string().trim().optional().default(""),
  acceptanceNote: z.string().trim().optional().default(""),
  schedule: z.array(wizardScheduleSchema).default([]),
});

export const wizardSchema = wizardStep1Schema
  .merge(wizardStep2Schema)
  .merge(wizardStep3Schema)
  .merge(wizardStep4Schema);

export type WizardEquipment = z.infer<typeof wizardEquipmentSchema>;
export type WizardPayment = z.infer<typeof wizardPaymentSchema>;
export type WizardSchedule = z.infer<typeof wizardScheduleSchema>;
export type WizardModule = z.infer<typeof wizardModuleSchema>;
export type WizardData = z.infer<typeof wizardSchema>;

export type WizardActionResult =
  | { ok: true; proposalId: string }
  | { ok: false; errors?: Record<string, string[]>; message?: string };
