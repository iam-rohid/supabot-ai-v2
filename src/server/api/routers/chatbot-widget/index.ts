import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { projectsTable } from "@/lib/schema/projects";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const chatbotRouter = createTRPCRouter({
  project: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.id));
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project Not Found!",
        });
      }
      return project;
    }),
});
