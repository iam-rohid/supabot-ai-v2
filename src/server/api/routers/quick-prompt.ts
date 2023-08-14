import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { quickPromptsTable } from "@/lib/schema/quick-prompts";
import { and, desc, eq } from "drizzle-orm";
import { requireProjectUser } from "./common";
import {
  createQuickPromptSchema,
  updateQuickPromptSchema,
} from "@/lib/validations";

export const quickPromptRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(quickPromptsTable)
        .where(eq(quickPromptsTable.projectId, input.projectId))
        .orderBy(desc(quickPromptsTable.updatedAt));
    }),
  create: protectedProcedure
    .input(createQuickPromptSchema)
    .mutation(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId);
      return ctx.db.insert(quickPromptsTable).values(input).returning();
    }),
  update: protectedProcedure
    .input(updateQuickPromptSchema)
    .mutation(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId);
      return ctx.db
        .update(quickPromptsTable)
        .set({
          ...(input.title ? { title: input.title } : {}),
          ...(input.prompt ? { prompt: input.prompt } : {}),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(quickPromptsTable.id, input.id),
            eq(quickPromptsTable.projectId, input.projectId)
          )
        )
        .returning();
    }),
  delete: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId);
      return ctx.db
        .delete(quickPromptsTable)
        .where(
          and(
            eq(quickPromptsTable.id, input.id),
            eq(quickPromptsTable.projectId, input.projectId)
          )
        )
        .returning();
    }),
});
