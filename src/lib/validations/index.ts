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
