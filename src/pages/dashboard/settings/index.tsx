import SettingsLayout from "@/layouts/settings-layout";
import { getServerAuthSession } from "@/server/auth";
import { type NextPageWithLayout } from "@/types/next";
import { type GetServerSideProps } from "next";

const Page: NextPageWithLayout = () => {
  return <div>General Settings</div>;
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: {
      session,
    },
  };
};
