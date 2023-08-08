import DeleteProjectForm from "@/components/forms/delete-project-form";
import UpdateProjecNameForm from "@/components/forms/update-project-name-form";
import UpdateProjectSlugForm from "@/components/forms/update-project-slug-form";
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
  if (project.isLoading) {
    return <p>Loading...</p>;
  }
  if (project.isError) {
    return <p>Error</p>;
  }
  if (!project.data) {
    return <p>Project not found!</p>;
  }

  return (
    <div className="grid gap-8">
      <UpdateProjecNameForm project={project.data} />
      <UpdateProjectSlugForm project={project.data} />
      <DeleteProjectForm project={project.data} />
    </div>
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
