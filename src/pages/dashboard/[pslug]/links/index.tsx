import ButtonLoadingSpinner from "@/components/button-loading-spinner";
import { useAddLinkModal } from "@/components/modals/add-link-modal";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/layouts/dashboard-layout";
import { type Link as LinkRow } from "@/lib/schema/links";
import { useProject } from "@/providers/project-provider";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MoreHorizontal, RefreshCcw, Trash } from "lucide-react";
import Link from "next/link";

const statusColors: Record<LinkRow["trainingStatus"], string> = {
  idle: "#333333",
  failed: "#FF0000",
  trained: "#50E3C2",
  training: "#F5A623",
};
const statusLabels: Record<LinkRow["trainingStatus"], string> = {
  idle: "Queued",
  failed: "Error",
  trained: "Trained",
  training: "Training",
};

const Page: NextPageWithLayout = () => {
  const { project } = useProject();
  const links = api.link.getAll.useQuery(
    {
      projectSlug: project.slug,
    },
    {
      refetchInterval: 1000 * 60, // Refetch every 1 min
    }
  );
  const { toast } = useToast();
  const utils = api.useContext();

  const retrainLink = api.link.retrain.useMutation({
    onSuccess: () => {
      utils.link.getAll.refetch({ projectSlug: project.slug });
      toast({ title: "Link is retraining" });
    },
    onError: (error) => {
      toast({
        title: "Failed to retrain retrain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLink = api.link.delete.useMutation({
    onSuccess: () => {
      utils.link.getAll.refetch({ projectSlug: project.slug });
      toast({ title: "Link delete success" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (links.isLoading) {
    return (
      <>
        <header className="border-b bg-card text-card-foreground">
          <div className="container flex min-h-[8rem] items-center py-2">
            <Skeleton className="h-8 w-32" />
            <div className="flex-1"></div>
            <Skeleton className="mr-2 h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </header>

        <main className="container py-8">
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
                {new Array(3).fill(1).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-6 w-96" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-10" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </>
    );
  }
  if (links.isError) {
    return <p>Error</p>;
  }

  return (
    <>
      <PageHeader title="Links">
        <Button
          onClick={() => links.refetch()}
          className="mr-2"
          disabled={links.isRefetching}
          variant="outline"
        >
          {links.isRefetching ? (
            <ButtonLoadingSpinner />
          ) : (
            <RefreshCcw className="-ml-1 mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
        <AddLinkButton projectSlug={project.slug} />
      </PageHeader>
      <main className="container py-8">
        {links.data.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>You haven&apos;t added any links yet!</CardTitle>
            </CardHeader>

            <CardFooter className="justify-center">
              <AddLinkButton projectSlug={project.slug} />
            </CardFooter>
          </Card>
        ) : (
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: statusColors[link.trainingStatus],
                          }}
                        />
                        {statusLabels[link.trainingStatus]}
                      </div>
                    </TableCell>
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
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              retrainLink.mutate({
                                linkId: link.id,
                              })
                            }
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Retrain
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="focus:bg-destructive focus:text-destructive-foreground"
                            onClick={() =>
                              deleteLink.mutate({ linkId: link.id })
                            }
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const AddLinkButton = ({ projectSlug }: { projectSlug: string }) => {
  const [, setOpen, Modal] = useAddLinkModal({ projectSlug });
  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Link</Button>
      <Modal />
    </>
  );
};
