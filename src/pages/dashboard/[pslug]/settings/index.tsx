import DeleteProjectForm from "@/components/forms/delete-project-form";
import UpdateProjecNameForm from "@/components/forms/update-project-name-form";
import UpdateProjectSlugForm from "@/components/forms/update-project-slug-form";
import SettingsLayout from "@/layouts/settings-layout";
import { useProject } from "@/providers/project-provider";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  const { project } = useProject();

  return (
    <div className="grid gap-8">
      <UpdateProjecNameForm project={project} />
      <UpdateProjectSlugForm project={project} />
      <DeleteProjectForm project={project} />
    </div>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
