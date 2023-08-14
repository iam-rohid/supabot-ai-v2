import ButtonLoadingSpinner from "@/components/button-loading-spinner";
import { useAddQuickPromptModal } from "@/components/modals/add-quick-prompt-modal";
import UpdateQuickPromptModal from "@/components/modals/update-quick-prompt-modal";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/layouts/dashboard-layout";
import { type QuickPrompt } from "@/lib/schema/quick-prompts";
import { useProject } from "@/providers/project-provider";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import {
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Trash,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";

const Page: NextPageWithLayout = () => {
  const { project } = useProject();
  const { resolvedTheme } = useTheme();
  const quickPrompts = api.quickPrompt.getAll.useQuery({
    projectId: project.id,
  });
  const [updatePrompt, setUpdatePrompt] = useState<QuickPrompt | null>(null);
  const { toast } = useToast();

  const deletePrompt = api.quickPrompt.delete.useMutation({
    onSuccess: () => {
      quickPrompts.refetch(), toast({ title: "Quick prompt deleted" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete quick prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (quickPrompts.isLoading) {
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
          <Card>
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
                    <TableCell className="py-0">
                      <Skeleton className="h-10 w-10" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </>
    );
  }
  if (quickPrompts.isError) {
    return <p>Error</p>;
  }
  return (
    <>
      <PageHeader title="Quick Prompts">
        <Button
          onClick={() => quickPrompts.refetch()}
          className="mr-2"
          disabled={quickPrompts.isRefetching}
          variant="outline"
        >
          {quickPrompts.isRefetching ? (
            <ButtonLoadingSpinner />
          ) : (
            <RefreshCcw className="-ml-1 mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
        <AddQuickPromptButton />
      </PageHeader>

      <main className="container py-8">
        {quickPrompts.data.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>You don&apos;t have any quick prompts yet!</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/images/empty-box-dark.png"
                    : "/images/empty-box.png"
                }
                width={512}
                height={512}
                alt="Empty Box"
                className="mx-auto h-64 w-64 object-contain"
              />
            </CardContent>
            <CardFooter className="justify-center">
              <AddQuickPromptButton label="Add a Quick Prompt" />
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>TITLE</TableHead>
                  <TableHead>PROMPT</TableHead>
                  <TableHead>LAST UPDATED</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quickPrompts.data.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell>{prompt.title}</TableCell>
                    <TableCell>{prompt.prompt}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(prompt.updatedAt, {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="py-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            disabled={deletePrompt.isLoading}
                            variant="ghost"
                            size="icon"
                          >
                            {deletePrompt.isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => setUpdatePrompt(prompt)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="focus:bg-destructive focus:text-destructive-foreground"
                            onClick={() =>
                              deletePrompt.mutate({
                                id: prompt.id,
                                projectId: prompt.projectId,
                              })
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
          </Card>
        )}
      </main>
      {!!updatePrompt && (
        <UpdateQuickPromptModal
          open={!!updatePrompt}
          onOpenChange={(value) => {
            if (!value) {
              setUpdatePrompt(null);
            }
          }}
          quickPrompt={updatePrompt}
        />
      )}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const AddQuickPromptButton = ({ label = "Add Prompt" }: { label?: string }) => {
  const [, setOpen, Modal] = useAddQuickPromptModal();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="-ml-1 mr-2 h-4 w-4" />
        {label}
      </Button>
      <Modal />
    </>
  );
};
