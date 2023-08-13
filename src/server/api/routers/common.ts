import {
  type ProjectUserRole,
  projectUsersTable,
} from "@/lib/schema/project-users";
import { projectsTable } from "@/lib/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { type createTRPCContext } from "../trpc";

type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

export const requireProjectUser = async (
  ctx: Ctx,
  projectId: string,
  roles: ProjectUserRole[] = ["owner", "admin", "member"]
) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
  const [projectUser] = await ctx.db
    .select()
    .from(projectUsersTable)
    .where(
      and(
        eq(projectUsersTable.userId, ctx.session?.user.id),
        eq(projectUsersTable.projectId, projectId)
      )
    );
  if (!projectUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found!",
    });
  }
  if (!roles.includes(projectUser.role)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Permission denied",
    });
  }
  return projectUser;
};
export const requireProjectUserBySlug = async (
  ctx: Ctx,
  projectSlug: string,
  roles: ProjectUserRole[] = ["owner", "admin", "member"]
) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
  const [projectUser] = await ctx.db
    .select({
      projectId: projectUsersTable.projectId,
      userId: projectUsersTable.userId,
      role: projectUsersTable.role,
      name: projectsTable.name,
      slug: projectsTable.slug,
    })
    .from(projectUsersTable)
    .innerJoin(projectsTable, eq(projectsTable.id, projectUsersTable.projectId))
    .where(
      and(
        eq(projectUsersTable.userId, ctx.session.user.id),
        eq(projectsTable.slug, projectSlug)
      )
    );
  if (!projectUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found!",
    });
  }
  if (!roles.includes(projectUser.role)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Permission denied",
    });
  }
  return projectUser;
};
