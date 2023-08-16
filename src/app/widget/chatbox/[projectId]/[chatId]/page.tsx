import Chatbox from "@/components/chat";
import { Button } from "@/components/ui/button";
import { chatsTable } from "@/lib/schema/chat";
import { messagesTable } from "@/lib/schema/messages";
import {
  type QuickPrompt,
  quickPromptsTable,
} from "@/lib/schema/quick-prompts";
import { db } from "@/server/db";
import { getProjectById } from "@/server/models/project";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Chat({
  params: { chatId, projectId },
}: {
  params: { chatId: string; projectId: string };
}) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(and(eq(chatsTable.projectId, projectId), eq(chatsTable.id, chatId)));
  if (!chat) notFound();

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId));

  let quickPrompts: QuickPrompt[] = [];
  if (messages.length === 0) {
    quickPrompts = await db
      .select()
      .from(quickPromptsTable)
      .where(eq(quickPromptsTable.projectId, projectId));
  }
  return (
    <>
      <header className="header top-0 z-20 border-b bg-card text-card-foreground backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between gap-2 px-2">
          <div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/widget/chatbox/${projectId}`}>
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
          </div>
          <h1 className="header-title text-lg font-semibold">{project.name}</h1>
          <div className="flex-1"></div>
        </div>
      </header>
      <Chatbox
        project={project}
        chat={chat}
        messages={messages}
        quickPrompts={quickPrompts}
      />
    </>
  );
}
