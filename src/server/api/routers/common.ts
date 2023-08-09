import {
  type ProjectUserRole,
  projectUsersTable,
} from "@/lib/schema/project-users";
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
