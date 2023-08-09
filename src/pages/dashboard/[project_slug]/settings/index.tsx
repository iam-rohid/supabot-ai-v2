import DeleteProjectForm from "@/components/forms/delete-project-form";
import UpdateProjecNameForm from "@/components/forms/update-project-name-form";
import UpdateProjectSlugForm from "@/components/forms/update-project-slug-form";
import { Skeleton } from "@/components/ui/skeleton";
import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const Page: NextPageWithLayout = () => {
  const {
    query: { project_slug },
  } = useRouter();
  const project = api.project.getBySlug.useQuery({
    projectSlug: project_slug as string,
  });
  if (project.isLoading) {
    return (
      <div className="grid gap-8">
        <Skeleton className="h-[300px]"></Skeleton>
        <Skeleton className="h-[300px]"></Skeleton>
        <Skeleton className="h-[300px]"></Skeleton>
      </div>
    );
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
