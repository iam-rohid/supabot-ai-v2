import { createProjectSchema } from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const projectsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.project.findMany({
      where: { projectUsers: { some: { userId: ctx.session.user.id } } },
      orderBy: { updatedAt: "desc" },
    })
  ),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.project.findUnique({
        where: {
          id: input.id,
          projectUsers: { some: { userId: ctx.session.user.id } },
        },
      })
    ),
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string().min(1).max(32) }))
    .query(({ ctx, input }) =>
      ctx.prisma.project.findUnique({
        where: {
          slug: input.slug,
          projectUsers: { some: { userId: ctx.session.user.id } },
        },
      })
    ),
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.project.create({
        data: {
          ...input,
          projectUsers: {
            create: {
              role: "OWNER",
              userId: ctx.session.user.id,
            },
          },
        },
      })
    ),
});
