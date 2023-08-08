import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  email: z.string().min(1).email().optional(),
  image: z.string().url().nullish(),
});
