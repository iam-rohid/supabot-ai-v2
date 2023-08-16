import { chatsTable } from "@/lib/schema/chat";
import { projectsTable } from "@/lib/schema/projects";
import { createChatSchema } from "@/lib/validations";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { projectId } = createChatSchema.parse(await req.json());
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId));
  if (!project) {
    throw new NextResponse("Project not found", {
      status: 404,
    });
  }
  const [chat] = await db.insert(chatsTable).values({ projectId }).returning();
  return NextResponse.json(chat);
};
