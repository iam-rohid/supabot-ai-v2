import ChatbotWidgetLayout from "@/layouts/chatbot-widget-layout";
import { useChatbotWidget } from "@/providers/chatbot-widget-provider";
import { type NextPageWithLayout } from "@/types/next";
import Chatbox from "@/components/chat";

const Page: NextPageWithLayout = () => {
  const { project } = useChatbotWidget();

  return (
    <>
      <header className="header top-0 z-20 border-b bg-card text-card-foreground backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex1"></div>
          <h1 className="header-title font-semibold">{project.name}</h1>
          <div className="flex1"></div>
        </div>
      </header>
      <Chatbox />
    </>
  );
};

Page.getLayout = (page) => <ChatbotWidgetLayout>{page}</ChatbotWidgetLayout>;

export default Page;
