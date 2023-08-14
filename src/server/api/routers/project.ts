import {
  createProjectSchema,
  projectInvitationSchema,
  updateProjectSchema,
} from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { hashToken } from "@/server/auth";
import { sendEmail } from "@/server/email";
import ProjectInvitationEmail from "@/emails/project-invitation-email";
import { ALLOWED_EMAILS, APP_NAME } from "@/utils/constants";
import { projectUsersTable } from "@/lib/schema/project-users";
import { and, desc, eq } from "drizzle-orm";
import { projectsTable } from "@/lib/schema/projects";
import { usersTable } from "@/lib/schema/users";
import { projectInvitationsTable } from "@/lib/schema/project-invitations";
import { verificationTokensTable } from "@/lib/schema/verification-tokens";
import { requireProjectUser } from "./common";

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db
      .select({
        id: projectsTable.id,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        name: projectsTable.name,
        slug: projectsTable.slug,
        description: projectsTable.description,
        role: projectUsersTable.role,
      })
      .from(projectUsersTable)
      .innerJoin(
        projectsTable,
        eq(projectsTable.id, projectUsersTable.projectId)
      )
      .where(eq(projectUsersTable.userId, ctx.session.user.id))
      .orderBy(desc(projectsTable.updatedAt));
    return projects;
  }),
  getById: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .select()
        .from(projectUsersTable)
        .innerJoin(
          projectsTable,
          eq(projectsTable.id, projectUsersTable.projectId)
        )
        .where(
          and(
            eq(projectUsersTable.userId, ctx.session.user.id),
            eq(projectsTable.id, input.projectId)
          )
        );
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found!",
        });
      }
      return project.projects;
    }),
  getBySlug: protectedProcedure
    .input(z.object({ projectSlug: z.string().min(1).max(32) }))
    .query(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .select()
        .from(projectUsersTable)
        .innerJoin(
          projectsTable,
          eq(projectsTable.id, projectUsersTable.projectId)
        )
        .where(
          and(
            eq(projectUsersTable.userId, ctx.session.user.id),
            eq(projectsTable.slug, input.projectSlug)
          )
        );
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found!",
        });
      }
      return project.projects;
    }),
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Simple Rate Lmiting
      if (!ALLOWED_EMAILS.includes(ctx.session.user.email!)) {
        const existingProjects = await ctx.db
          .select({})
          .from(projectUsersTable)
          .where(eq(projectUsersTable.userId, ctx.session.user.id));
        if (existingProjects.length + 1 > 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can not create more than 1 project as of now.",
          });
        }
      }
      const [alreadyExists] = await ctx.db
        .select({})
        .from(projectsTable)
        .where(eq(projectsTable.slug, input.slug));
      if (alreadyExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A project with the same slug already exists",
        });
      }
      const [project] = await ctx.db
        .insert(projectsTable)
        .values({
          ...input,
        })
        .returning();
      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }
      const [projectUser] = await ctx.db
        .insert(projectUsersTable)
        .values({
          projectId: project.id,
          userId: ctx.session.user.id,
          role: "owner",
        })
        .returning();
      if (!projectUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed assign you as an owner",
        });
      }
      return {
        project,
        projectUser,
      };
    }),
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        data: updateProjectSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId, ["owner", "admin"]);
      if (input.data.slug) {
        const [alreadyExists] = await ctx.db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.slug, input.data.slug));
        if (alreadyExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A project with the same slug already exists",
          });
        }
      }
      try {
        const [updatedProject] = await ctx.db
          .update(projectsTable)
          .set({
            ...(typeof input.data.name !== "undefined"
              ? { name: input.data.name }
              : {}),
            ...(typeof input.data.slug !== "undefined"
              ? { slug: input.data.slug }
              : {}),
          })
          .where(eq(projectsTable.id, input.projectId))
          .returning();
        if (!updatedProject) {
          throw "Failed to update project";
        }
        return updatedProject;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  delete: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId, ["owner"]);
      const [deletedProject] = await ctx.db
        .delete(projectsTable)
        .where(eq(projectsTable.id, input.projectId))
        .returning();
      if (!deletedProject) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete project",
        });
      }
      return deletedProject;
    }),
  getMembers: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId);
      return ctx.db
        .select()
        .from(projectUsersTable)
        .innerJoin(usersTable, eq(usersTable.id, projectUsersTable.userId))
        .where(eq(projectUsersTable.projectId, input.projectId));
    }),
  removeMember: protectedProcedure
    .input(z.object({ projectId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const projectUser = await requireProjectUser(ctx, input.projectId, [
        "owner",
        "admin",
      ]);
      const [member] = await ctx.db
        .select()
        .from(projectUsersTable)
        .where(eq(projectUsersTable.projectId, input.projectId));
      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found!",
        });
      }
      if (member.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove an owner from project.",
        });
      }
      if (member.role === "admin" && projectUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only an owner can remove an admin from project",
        });
      }
      const [deletedProjectUser] = await ctx.db
        .delete(projectUsersTable)
        .where(
          and(
            eq(projectUsersTable.projectId, member.projectId),
            eq(projectUsersTable.userId, member.userId)
          )
        )
        .returning();
      if (!deletedProjectUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove member",
        });
      }
      return deletedProjectUser;
    }),
  getInvitations: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId);
      return ctx.db
        .select()
        .from(projectInvitationsTable)
        .where(eq(projectInvitationsTable.projectId, input.projectId));
    }),
  invite: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        data: projectInvitationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.projectId));
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project Not Found!",
        });
      }
      await requireProjectUser(ctx, input.projectId, ["owner", "admin"]);
      const [invitationExists] = await ctx.db
        .select()
        .from(projectInvitationsTable)
        .where(
          and(
            eq(projectInvitationsTable.projectId, input.projectId),
            eq(projectInvitationsTable.email, input.data.email)
          )
        );
      if (invitationExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already invited",
        });
      }
      const [userExists] = await ctx.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, input.data.email));
      if (userExists) {
        const [alreadyInProject] = await ctx.db
          .select()
          .from(projectUsersTable)
          .where(
            and(
              eq(projectUsersTable.projectId, input.projectId),
              eq(projectUsersTable.userId, userExists.id)
            )
          );
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
        callbackUrl: `${process.env.NEXTAUTH_URL}/dashboard/${project.slug}/invitation`,
        token,
        email: input.data.email,
      });

      const url = `${
        process.env.NEXTAUTH_URL
      }/api/auth/callback/email?${params.toString()}`;

      const [invitation] = await ctx.db
        .insert(projectInvitationsTable)
        .values({
          email: input.data.email,
          projectId: input.projectId,
          expires,
        })
        .returning();

      await ctx.db.insert(verificationTokensTable).values({
        identifier: input.data.email,
        expires,
        token: hashToken(token),
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
            projectName: project.name,
          }),
        });
      } else {
        console.log("Project Invitation Link: ", url);
      }

      return invitation;
    }),
  deleteInvitation: protectedProcedure
    .input(z.object({ projectId: z.string(), data: projectInvitationSchema }))
    .mutation(async ({ ctx, input }) => {
      await requireProjectUser(ctx, input.projectId, ["owner", "admin"]);
      const [invitationExists] = await ctx.db
        .select()
        .from(projectInvitationsTable)
        .where(
          and(
            eq(projectInvitationsTable.projectId, input.projectId),
            eq(projectInvitationsTable.email, input.data.email)
          )
        );
      if (!invitationExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }
      const [deletedInvitation] = await ctx.db
        .delete(projectInvitationsTable)
        .where(
          and(
            eq(projectInvitationsTable.projectId, input.projectId),
            eq(projectInvitationsTable.email, input.data.email)
          )
        )
        .returning();
      if (!deletedInvitation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Faield to delete invitation",
        });
      }
      return deletedInvitation;
    }),
  invitation: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [invitation] = await ctx.db
        .select()
        .from(projectInvitationsTable)
        .innerJoin(
          projectsTable,
          eq(projectsTable.id, projectInvitationsTable.projectId)
        )
        .where(
          and(
            eq(projectInvitationsTable.email, ctx.session.user.email!),
            eq(projectsTable.slug, input.projectSlug)
          )
        );
      if (!invitation) {
        return null;
      }
      return invitation;
    }),
  acceptInvitation: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const matcher = and(
        eq(projectInvitationsTable.email, ctx.session.user.email!),
        eq(projectInvitationsTable.projectId, input.projectId)
      );
      const [invitation] = await ctx.db
        .select()
        .from(projectInvitationsTable)
        .where(matcher);
      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found!",
        });
      }
      const [projectUser] = await ctx.db
        .insert(projectUsersTable)
        .values({
          projectId: invitation.projectId,
          userId: ctx.session.user.id,
          role: invitation.role,
        })
        .returning();
      if (!projectUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invitation",
        });
      }
      await ctx.db.delete(projectInvitationsTable).where(matcher);
      return projectUser;
    }),
});
