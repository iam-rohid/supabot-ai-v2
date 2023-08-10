import {
  type ProjectUserRole,
  projectUsersTable,
} from "@/lib/schema/project-users";
import { projectsTable } from "@/lib/schema/projects";
import { type DB } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const requireProjectUser = async (
  db: DB,
  userId: string,
  projectId: string,
  roles: ProjectUserRole[] = ["owner", "admin", "member"]
) => {
  const [projectUser] = await db
    .select()
    .from(projectUsersTable)
    .where(
      and(
        eq(projectUsersTable.userId, userId),
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
  db: DB,
  userId: string,
  projectSlug: string,
  roles: ProjectUserRole[] = ["owner", "admin", "member"]
) => {
  const [projectUser] = await db
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
        eq(projectUsersTable.userId, userId),
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
