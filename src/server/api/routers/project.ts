import { createProjectSchema, updateProjectSchema } from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateProjectSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const projectUser = await ctx.prisma.projectUser.findFirst({
        where: { projectId: input.id, userId: ctx.session.user.id },
      });
      if (!projectUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found!",
        });
      }
      if (!["OWNER", "ADMIN"].includes(projectUser.role)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Only the project owner and admin can update project details",
        });
      }
      try {
        const updatedProject = await ctx.prisma.project.update({
          where: {
            id: input.id,
            projectUsers: {
              some: {
                role: { in: ["OWNER", "ADMIN"] },
                userId: ctx.session.user.id,
              },
            },
          },
          data: {
            ...(typeof input.data.name !== "undefined"
              ? { name: input.data.name }
              : {}),
            ...(typeof input.data.slug !== "undefined"
              ? { slug: input.data.slug }
              : {}),
          },
        });
        return updatedProject;
      } catch (err) {
        if (
          err instanceof PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug is already in use",
          });
        }
        throw err;
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const projectUser = await ctx.prisma.projectUser.findFirst({
        where: { projectId: input.id, userId: ctx.session.user.id },
      });
      if (!projectUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found!",
        });
      }
      if (projectUser.role !== "OWNER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the project owner can delete projects.",
        });
      }
      return ctx.prisma.project.delete({
        where: {
          id: input.id,
          projectUsers: {
            some: {
              role: { in: ["OWNER"] },
              userId: ctx.session.user.id,
            },
          },
        },
      });
    }),
});
