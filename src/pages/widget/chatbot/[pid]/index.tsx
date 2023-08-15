import ChatbotWidgetLayout from "@/layouts/chatbot-widget-layout";
import { useChatbotWidget } from "@/providers/chatbot-widget-provider";
import { type NextPageWithLayout } from "@/types/next";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import ButtonLoadingSpinner from "@/components/button-loading-spinner";

const Page: NextPageWithLayout = () => {
  const { project } = useChatbotWidget();

  const router = useRouter();
  const { toast } = useToast();
  const createChat = api.chat.create.useMutation({
    onSuccess: (chat) => {
      router.push(`/widget/chatbot/${project.id}/chat/${chat.id}`);
    },
    onError: (error) =>
      toast({
        title: "Failed to start a conversation",
        description: error.message,
        variant: "destructive",
      }),
  });

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
          <Button
            onClick={() => createChat.mutate({ projectId: project.id })}
            disabled={createChat.isLoading}
          >
            {createChat.isLoading && <ButtonLoadingSpinner />}
            Start a Conversation
            <ArrowRight className="-mr-1 ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

Page.getLayout = (page) => <ChatbotWidgetLayout>{page}</ChatbotWidgetLayout>;

export default Page;
