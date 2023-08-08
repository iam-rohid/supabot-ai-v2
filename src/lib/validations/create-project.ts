import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(32),
  slug: z
    .string({ required_error: "Slug is required" })
    .min(1, "Slug is required")
    .max(32),
});

export type CreateProjectSchemaData = z.infer<typeof createProjectSchema>;
