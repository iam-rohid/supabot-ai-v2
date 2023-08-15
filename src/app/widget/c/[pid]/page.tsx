import { getProjectById } from "@/server/models/project";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function Page({
  params: { pid },
}: {
  params: { pid: string };
}) {
  const project = await getProjectById(pid);
  if (!project) {
    notFound();
  }

  // const startConversation = async () => {
  //   "use server";
  //   console.log(project);
  //   const [chat] = await db
  //     .insert(chatsTable)
  //     .values({ projectId: project.id })
  //     .returning({ id: chatsTable.id });

  //   if (!chat) {
  //     throw "Failed to create a conversation";
  //   }

  //   redirect(`/widget/c/${project.id}/${chat.id}`);
  // };

  return (
    <>
      <header className="header top-0 z-20 border-b bg-card text-card-foreground backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex1"></div>
          <h1 className="header-title font-semibold">{project.name}</h1>
          <div className="flex1"></div>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Image
          src={`/api/avatar/${project.id}`}
          alt=""
          width={512}
          height={512}
          className="h-16 w-16 rounded-full object-cover"
        />
        <h1 className="mt-4 text-xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
        <div className="mt-8">
          {/* <form action={startConversation}> */}
          <Button type="submit">
            Start a Conversation
            <ArrowRight className="-mr-1 ml-2 h-4 w-4" />
          </Button>
          {/* </form> */}
        </div>
      </div>
    </>
  );
}
