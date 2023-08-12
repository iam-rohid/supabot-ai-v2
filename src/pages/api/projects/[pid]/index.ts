import { projectsTable } from "@/lib/schema/projects";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId as string));
  return res.json(project);
}
