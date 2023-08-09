import { useDeleteProjectModal } from "@/components/modals/delete-project-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { type Project } from "@/lib/schema/projects";
import { APP_NAME } from "@/utils/constants";

export default function DeleteProjectForm({ project }: { project: Project }) {
  const [, setDeleteProjectModalOpen, DeleteProjectModal] =
    useDeleteProjectModal({ project });

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Delete Project</CardTitle>
          <CardDescription>
            Permanently delete your project on {APP_NAME}, and their stats. This
            action cannot be undone - please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={() => setDeleteProjectModalOpen(true)}
          >
            Delete Project
          </Button>
        </CardFooter>
      </Card>
      <DeleteProjectModal />
    </>
  );
}
