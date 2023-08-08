import { useCreateProjectModal } from "@/components/modals/create-project-modal";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getServerAuthSession } from "@/server/auth";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { type GetServerSideProps } from "next";
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
          <p>Loading...</p>
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
          <Card className="text-center">
            <CardHeader>
              <CardTitle>You don&apos;t have any projects yet!</CardTitle>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: {
      session,
    },
  };
};
