import DeleteProjectForm from "@/components/forms/delete-project-form";
import UpdateProjecNameForm from "@/components/forms/update-project-name-form";
import UpdateProjectSlugForm from "@/components/forms/update-project-slug-form";
import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return (
    <div className="grid gap-8">
      <UpdateProjecNameForm />
      <UpdateProjectSlugForm />
      <DeleteProjectForm />
    </div>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
