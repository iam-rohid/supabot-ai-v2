import PageHeader from "@/components/page-header";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getServerAuthSession } from "@/server/auth";
import { type NextPageWithLayout } from "@/types/next";
import { type GetServerSideProps } from "next";

const Page: NextPageWithLayout = () => {
  return (
    <>
      <PageHeader title="Overview" />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: {
      session,
    },
  };
};
