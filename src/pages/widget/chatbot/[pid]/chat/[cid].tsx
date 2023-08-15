import ChatbotWidgetLayout from "@/layouts/chatbot-widget-layout";
import { useChatbotWidget } from "@/providers/chatbot-widget-provider";
import { type NextPageWithLayout } from "@/types/next";
import Chatbox from "@/components/chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const Page: NextPageWithLayout = () => {
  const { project } = useChatbotWidget();
  const {
    query: { cid, pid },
  } = useRouter();
  const chat = api.chat.findOne.useQuery({
    chatId: cid as string,
    projectId: pid as string,
  });

  return (
    <>
      <header className="header top-0 z-20 border-b bg-card text-card-foreground backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between gap-2 px-2">
          <div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/widget/chatbot/${project.id}`}>
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
          </div>
          <h1 className="header-title text-lg font-semibold">{project.name}</h1>
          <div className="flex-1"></div>
        </div>
      </header>
      <pre>{JSON.stringify(chat.data, null, 2)}</pre>
      <Chatbox />
    </>
  );
};

Page.getLayout = (page) => <ChatbotWidgetLayout>{page}</ChatbotWidgetLayout>;

export default Page;
