import { type ReactNode } from "react";
import { getProjectById } from "@/server/models/project";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import { APP_NAME, BASE_URL } from "@/utils/constants";
import { type Metadata } from "next";
import ChatboxWidgetProvider from "./chatbox-widget-provider";
import Link from "next/link";

export const metadata: Metadata = {
  title: APP_NAME,
};

export default async function Layout({
  children,
  params: { projectId },
}: {
  children: ReactNode;
  params: { projectId: string };
}) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  return (
    <ChatboxWidgetProvider project={project}>
      <div className="flex h-screen w-screen flex-col">
        {children}
        <div className="flex items-center justify-center border-t bg-card p-2">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link
              href={BASE_URL}
              target="_blank"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {APP_NAME}
            </Link>
          </p>
        </div>
      </div>
    </ChatboxWidgetProvider>
  );
}
