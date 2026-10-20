import { z } from "zod";

export const proposalStatusEnum = z.enum([
  "DRAFT",
  "SENT",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
]);

export const proposalFilterSchema = z.object({
  q: z.string().trim().optional(),
  status: proposalStatusEnum.optional().or(z.literal("")),
});

export type ProposalFilter = z.infer<typeof proposalFilterSchema>;
