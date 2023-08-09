import {
  createProjectSchema,
  projectInvitationSchema,
  updateProjectSchema,
} from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { hashToken } from "@/server/auth";
import { sendEmail } from "@/server/email";
import ProjectInvitationEmail from "@/emails/project-invitation-email";
import { APP_NAME } from "@/utils/constants";

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
  getMembers: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.projectUser.findMany({
        where: {
          project: {
            id: input.id,
            projectUsers: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }),
  removeMember: protectedProcedure
    .input(z.object({ projectId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const projectUser = await ctx.prisma.projectUser.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.session.user.id,
          },
        },
        select: {
          role: true,
          project: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
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
          message: "You don't have permission to remove anyone from project.",
        });
      }
      const member = await ctx.prisma.projectUser.findUnique({
        where: { projectId_userId: input },
      });
      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found!",
        });
      }
      if (member.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove an owner from project.",
        });
      }
      if (member.role === "ADMIN" && projectUser.role !== "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only an owner can remove an admin from project",
        });
      }
      return ctx.prisma.projectUser.delete({
        where: { projectId_userId: input },
      });
    }),
  getInvitations: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.projectInvitation.findMany({
        where: {
          project: {
            id: input.id,
            projectUsers: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      });
    }),
  invite: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: projectInvitationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const projectUser = await ctx.prisma.projectUser.findUnique({
        where: {
          projectId_userId: {
            projectId: input.id,
            userId: ctx.session.user.id,
          },
        },
        select: {
          role: true,
          project: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
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
          message: "Only the project owner and admin can invite new members",
        });
      }
      const invitationExists = await ctx.prisma.projectInvitation.findUnique({
        where: {
          projectId_email: { email: input.data.email, projectId: input.id },
        },
      });
      if (invitationExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already invited",
        });
      }
      const userExists = await ctx.prisma.user.findUnique({
        where: { email: input.data.email },
      });
      if (userExists) {
        const alreadyInProject = await ctx.prisma.projectUser.findUnique({
          where: {
            projectId_userId: { userId: userExists.id, projectId: input.id },
          },
        });
        if (alreadyInProject) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already exists in this project",
          });
        }
      }

      const expires = new Date(Date.now() + 86_400 * 14 * 1000); // 86_400 is 1 day in seconds
      const token = randomBytes(32).toString("hex");
      const params = new URLSearchParams({
        callbackUrl: `${process.env.NEXTAUTH_URL}/dashboard/${projectUser.project.slug}/invitation`,
        token,
        email: input.data.email,
      });

      const url = `${
        process.env.NEXTAUTH_URL
      }/api/auth/callback/email?${params.toString()}`;

      const invitation = await ctx.prisma.projectInvitation.create({
        data: {
          email: input.data.email,
          expires,
          projectId: input.id,
          role: "MEMBER",
        },
      });

      await ctx.prisma.verificationToken.create({
        data: {
          identifier: input.data.email,
          expires,
          token: hashToken(token),
        },
      });

      if (process.env.NODE_ENV === "production") {
        await sendEmail({
          subject: `You've been invited to join a project on ${APP_NAME}`,
          email: input.data.email,
          react: ProjectInvitationEmail({
            url,
            email: input.data.email,
            inviterEmail: ctx.session.user.email!,
            inviterName: ctx.session.user.name || ctx.session.user.email!,
            projectName: projectUser.project.name,
          }),
        });
      } else {
        console.log("Project Invitation Link: ", url);
      }

      return invitation;
    }),
  deleteInvitation: protectedProcedure
    .input(z.object({ id: z.string(), data: projectInvitationSchema }))
    .mutation(async ({ ctx, input }) => {
      const projectUser = await ctx.prisma.projectUser.findUnique({
        where: {
          projectId_userId: {
            projectId: input.id,
            userId: ctx.session.user.id,
          },
        },
        select: {
          role: true,
          project: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
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
          message: "Only the project owner and admin can delete invitations",
        });
      }
      const invitationExists = await ctx.prisma.projectInvitation.findUnique({
        where: {
          projectId_email: { email: input.data.email, projectId: input.id },
        },
      });
      if (!invitationExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }
      return ctx.prisma.projectInvitation.delete({
        where: {
          projectId_email: { email: input.data.email, projectId: input.id },
        },
      });
    }),
  invitation: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.projectInvitation.findFirst({
        where: {
          email: ctx.session.user.email!,
          project: { slug: input.slug },
        },
        include: {
          project: { select: { name: true } },
        },
      });
    }),
  acceptInvitation: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.projectInvitation.findUnique({
        where: {
          projectId_email: {
            email: ctx.session.user.email!,
            projectId: input.projectId,
          },
        },
      });
      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found!",
        });
      }
      const projectUser = await ctx.prisma.projectUser.create({
        data: {
          projectId: invitation.projectId,
          userId: ctx.session.user.id,
          role: invitation.role,
        },
      });
      await ctx.prisma.projectInvitation.delete({
        where: {
          projectId_email: {
            projectId: invitation.projectId,
            email: invitation.email,
          },
        },
      });
      return projectUser;
    }),
});
