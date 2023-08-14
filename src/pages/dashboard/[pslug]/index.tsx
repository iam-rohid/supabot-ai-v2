import PageHeader from "@/components/page-header";
import WidgetScriptCard from "@/components/widget-script-card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return (
    <>
      <PageHeader title="Overview" />

      <div className="container py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <WidgetScriptCard />
        </div>
      </div>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
