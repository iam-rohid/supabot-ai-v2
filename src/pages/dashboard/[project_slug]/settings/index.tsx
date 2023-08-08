import SettingsLayout from "@/layouts/settings-layout";
import { getServerAuthSession } from "@/server/auth";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";

const Page: NextPageWithLayout = () => {
  const {
    query: { project_slug },
  } = useRouter();
  const project = api.project.getBySlug.useQuery({
    slug: project_slug as string,
  });
  return (
    <>
      <pre>{JSON.stringify(project.data, null, 2)}</pre>
    </>
  );
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
