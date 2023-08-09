import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/dashboard-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return (
    <>
      <PageHeader title="Links">
        <Button>Add Link</Button>
      </PageHeader>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
