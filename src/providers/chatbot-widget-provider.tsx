import { type Project } from "@/lib/schema/projects";
import { api } from "@/utils/api";
import Color from "color";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { type ReactNode, createContext, useContext, useEffect } from "react";

type ChatbotContextType = {
  project: Project;
};

const ChatbotWidgetContext = createContext<ChatbotContextType | null>(null);

const getHSL = (color: Color) => {
  return color
    .hsl()
    .string()
    .replace("hsl(", "")
    .replaceAll(",", "")
    .replace(")", "");
};

const ChatbotWidgetProvider = ({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const project = api.chatbot.project.useQuery({ id: projectId });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const primaryColor = new Color(router.query.color || "#6366F1").hsl();
      const primaryForegroundColor = new Color("#fff");

      document.getElementById("custom-color")?.remove();
      const styleNode = document.createElement("style");

      styleNode.innerHTML = `
      :root,
      .dark {
        --primary: ${getHSL(primaryColor)};
        --primary-foreground:  ${getHSL(primaryForegroundColor)};
        --ring: ${getHSL(primaryColor)};
      }
      `;
      styleNode.id = "custom-color";
      document.head.append(styleNode);
    }
  }, [router.query, router.query.color]);

  useEffect(() => {
    if (project.data?.customCss) {
      const oldStyleEl = document.getElementById("custom-css");
      if (oldStyleEl) {
        oldStyleEl.remove();
      }
      const styleNode = document.createElement("style");
      styleNode.innerHTML = project.data.customCss;
      styleNode.id = "custom-css";
      document.head.appendChild(styleNode);
    }
  }, [project.data?.customCss]);

  if (project.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
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
