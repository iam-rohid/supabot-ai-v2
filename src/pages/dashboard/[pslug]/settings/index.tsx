import DeleteProjectForm from "@/components/forms/delete-project-form";
import UpdateProjecNameForm from "@/components/forms/update-project-name-form";
import UpdateProjectSlugForm from "@/components/forms/update-project-slug-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SettingsLayout from "@/layouts/settings-layout";
import { useProject } from "@/providers/project-provider";
import { type NextPageWithLayout } from "@/types/next";
import { APP_NAME } from "@/utils/constants";

const Page: NextPageWithLayout = () => {
  const { project } = useProject();
  return (
    <div className="grid gap-8">
      <UpdateProjecNameForm />
      <UpdateProjectSlugForm />
      <Card>
        <CardHeader>
          <CardTitle>Project ID</CardTitle>
          <CardDescription>
            Used when interacting with {APP_NAME} API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={project.id} readOnly />
        </CardContent>
      </Card>
      <DeleteProjectForm />
    </div>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
