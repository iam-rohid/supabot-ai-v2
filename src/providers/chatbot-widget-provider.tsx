import { Project } from "@/lib/schema/projects";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { ReactNode, createContext, useContext } from "react";

type ChatbotContextType = {
  project: Project;
};

const ChatbotWidgetContext = createContext<ChatbotContextType | null>(null);

const ChatbotWidgetProvider = ({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) => {
  const project = api.chatbot.project.useQuery({ id: projectId }, {});

  if (project.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (project.isError) {
    return <p>{project.error.message}</p>;
  }

  return (
    <ChatbotWidgetContext.Provider value={{ project: project.data }}>
      {children}
    </ChatbotWidgetContext.Provider>
  );
};
export default ChatbotWidgetProvider;

export const useChatbotWidget = () => {
  const context = useContext(ChatbotWidgetContext);
  if (!context) {
    throw "useChatbotWidge must use inside ChatbotWidgetProvider";
  }
  return context;
};
