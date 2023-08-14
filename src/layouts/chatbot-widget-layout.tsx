import ChatbotWidgetProvider from "@/providers/chatbot-widget-provider";
import { APP_NAME, BASE_URL } from "@/utils/constants";
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
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-secondary text-secondary-foreground">
        {children}
        <div className="flex items-center justify-center border-t bg-card px-2 py-1">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href={BASE_URL}
              target="_blank"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {APP_NAME}
            </a>
          </p>
        </div>
      </div>
    </ChatbotWidgetProvider>
  );
}
