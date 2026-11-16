import { z } from "#zod";

export const ProjectInput = z.object({
  name: z.string().min(1, "Name is required").max(80, "Keep the name under 80 characters"),
  description: z.string().max(500, "Keep the description under 500 characters").optional(),
  status: z.enum(["active", "paused"]),
});
export type ProjectInput = z.infer<typeof ProjectInput>;
