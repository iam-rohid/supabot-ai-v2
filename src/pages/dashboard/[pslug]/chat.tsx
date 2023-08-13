import DashboardLayout from "@/layouts/dashboard-layout";
import { useProject } from "@/providers/project-provider";
import { type NextPageWithLayout } from "@/types/next";
import React from "react";

const Chat: NextPageWithLayout = () => {
  const { project } = useProject();
  return (
    <div className="flex flex-1 px-4 py-8">
      <iframe
        src={`/widget/chatbot/${project.id}`}
        className="mx-auto my-auto block h-[678px] w-full max-w-md flex-1 rounded-lg border shadow-2xl"
      ></iframe>
    </div>
  );
};

Chat.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Chat;
