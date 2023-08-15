import { z } from "zod";

export * from "./create-project";
export * from "./create-link";
export * from "./update-user";

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  slug: z.string().min(1).max(32).optional(),
});

export const projectInvitationSchema = z.object({
  email: z.string().min(1).email(),
});

export const createQuickPromptSchema = z.object({
  projectId: z.string().uuid(),
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .max(80),
  prompt: z
    .string({ required_error: "Prompt is required" })
    .min(1, "Prompt is required")
    .max(500),
});
export const updateQuickPromptSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().max(80).optional(),
  prompt: z.string().max(500).optional(),
});

export const createChatSchema = z.object({
  projectId: z.string().uuid(),
  user: z
    .object({
      name: z.string().optional(),
      email: z.string().email(),
    })
    .optional(),
});
