import { projectsTable } from "@/lib/schema/projects";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { cache } from "react";

export const getProjectById = cache(async (pid: string) => {
  return await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, pid))
    .then((res) => res[0] ?? null);
});
