import ChatbotWidgetProvider from "@/providers/chatbot-widget-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { type ReactNode } from "react";

export default function ChatbotWidgetLayout({
  children,
}: {
  children: ReactNode;
}) {
  const {
    isReady,
    query: { pid },
  } = useRouter();
  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (typeof pid !== "string") {
    throw "pid params not found!";
  }

  return (
    <ChatbotWidgetProvider projectId={pid}>
      <div className="flex h-screen w-screen flex-col">{children}</div>
    </ChatbotWidgetProvider>
  );
}
