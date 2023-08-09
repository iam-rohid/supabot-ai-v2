import { useCreateProjectModal } from "@/components/modals/create-project-modal";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/layouts/dashboard-layout";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

const Page: NextPageWithLayout = () => {
  const projects = api.project.getAll.useQuery();
  const [, setCreateProjectOpen, CreateProjectModal] = useCreateProjectModal();

  const createNewProject = () => setCreateProjectOpen(true);

  return (
    <>
      <PageHeader title="Overview">
        <Button onClick={createNewProject}>New Project</Button>
      </PageHeader>

      <main className="container py-8">
        {projects.isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {new Array(4).fill(1).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : projects.isError ? (
          <p>Error</p>
        ) : projects.data.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((project) => (
              <Link
                key={project.slug}
                href={`/dashboard/${project.slug}`}
                className="space-y-4 rounded-lg border p-4 hover:border-foreground/20"
              >
                <div className="flex items-center">
                  <Image
                    src={`/api/avatar/${project.id}`}
                    alt="Image"
                    width={256}
                    height={256}
                    className="mr-4 h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.slug}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last updated{" "}
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="mx-auto max-w-screen-md text-center">
            <CardHeader>
              <CardTitle>You haven&apos;t created any projects yet!</CardTitle>
              <CardDescription>
                Click on the Create a Project button below to create your first
                super chat bot.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button onClick={createNewProject}>Create a Project</Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <CreateProjectModal />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
