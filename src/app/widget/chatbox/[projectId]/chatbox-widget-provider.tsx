"use client";

import { type Project } from "@/lib/schema/projects";
import Color from "color";
import { useEffect, type ReactNode, createContext, useContext } from "react";

function getTailwindVarFromColor(color: Color) {
  return color
    .hsl()
    .string()
    .replace("hsl(", "")
    .replaceAll(",", "")
    .replace(")", "");
}

export type ChatboxWidgetContextType = {
  project: Project;
};

export const ChatboxWidgetContext =
  createContext<ChatboxWidgetContextType | null>(null);

export default function ChatboxWidgetProvider({
  children,
  project,
}: {
  children: ReactNode;
  project: Project;
}) {
  useEffect(() => {
    const primary = new Color(project.theme.primary_color || "#6366F1");
    const primaryForeground = new Color(primary.isLight() ? "#000" : "#fff");
    document.documentElement.style.setProperty(
      "--primary",
      getTailwindVarFromColor(primary)
    );
    document.documentElement.style.setProperty(
      "--primary-foreground",
      getTailwindVarFromColor(primaryForeground)
    );
  }, [project.theme.primary_color]);

  return (
    <ChatboxWidgetContext.Provider value={{ project }}>
      {children}
    </ChatboxWidgetContext.Provider>
  );
}

export const useChatbox = () => {
  const context = useContext(ChatboxWidgetContext);
  if (!context) {
    throw new Error("useChatbox must use inside ChatboxWidgetProvider");
  }
  return context;
};
