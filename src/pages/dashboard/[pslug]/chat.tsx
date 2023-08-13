import PageHeader from "@/components/page-header";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useProject } from "@/providers/project-provider";
import { type NextPageWithLayout } from "@/types/next";

const Chat: NextPageWithLayout = () => {
  const { project } = useProject();
  return (
    <>
      <PageHeader title="Chat" />

      <div className="container py-8">
        <iframe
          src={`/widget/chatbot/${project.id}`}
          className="mx-auto block h-[620px] w-full max-w-[400px] flex-1 rounded-lg border shadow-2xl"
        />
      </div>
    </>
  );
};

Chat.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Chat;
