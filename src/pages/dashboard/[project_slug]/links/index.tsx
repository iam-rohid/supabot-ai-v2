import { useAddLinkModal } from "@/components/modals/add-link-modal";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/layouts/dashboard-layout";
import { type Project } from "@/lib/schema/projects";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const Page: NextPageWithLayout = () => {
  const {
    query: { project_slug },
  } = useRouter();
  const project = api.project.getBySlug.useQuery({
    projectSlug: project_slug as string,
  });

  if (!project.isSuccess) {
    return <p>Loading...</p>;
  }

  if (!project.data) {
    return <p>Project Not Found</p>;
  }

  return (
    <>
      <PageHeader title="Links">
        <AddLinkButton project={project.data} />
      </PageHeader>
      <main className="container py-8">
        <LinksList project={project.data} />
      </main>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const AddLinkButton = ({ project }: { project: Project }) => {
  const [, setOpen, Modal] = useAddLinkModal({ project });
  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Link</Button>
      <Modal />
    </>
  );
};

const LinksList = ({ project }: { project: Project }) => {
  const links = api.link.getAll.useQuery({ projectId: project.id });

  if (links.isLoading) {
    return <p>Loading...</p>;
  }
  if (links.isError) {
    return <p>Error</p>;
  }
  if (links.data.length === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>You haven&apos;t added any links yet!</CardTitle>
        </CardHeader>

        <CardFooter className="justify-center">
          <AddLinkButton project={project} />
        </CardFooter>
      </Card>
    );
  }
  return (
    <div className="rounded-lg border">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>LAST TRAINED ON</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.data.map((link) => (
            <TableRow key={link.id}>
              <TableCell>{link.url}</TableCell>
              <TableCell>{link.trainingStatus.toUpperCase()}</TableCell>
              <TableCell>
                {link.lastTrainedAt
                  ? formatDistanceToNow(new Date(link.lastTrainedAt), {
                      addSuffix: true,
                    })
                  : "-"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href={link.url} target="_blank">
                        Visit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Retrain</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
