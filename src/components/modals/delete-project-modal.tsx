import { useCallback, useMemo, useState } from "react";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { type UseModalReturning } from "./types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { api } from "@/utils/api";
import { type Project } from "@prisma/client";
import { useRouter } from "next/router";

const VERIFY_TEXT = "confirm delete project";

export function DeleteProjectModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}) {
  const schema = useMemo(
    () =>
      z.object({
        text: z.literal(VERIFY_TEXT),
        slug: z.literal(project.slug),
      }),
    [project.slug]
  );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useContext();

  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      toast({ title: "Project deleted" });
      onOpenChange(false);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Failed to delete account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = form.handleSubmit((data) => {
    if (data.slug !== project.slug) {
      form.setError("slug", { message: "Slug didn't matched" });
      return;
    }
    deleteProject.mutate({ id: project.id });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Warning: This will permanently delete your project and their
            respective stats.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleDelete} className="space-y-6">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enter the project slug <strong>{project.slug}</strong> to
                    continue
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    To verify, type <strong>{VERIFY_TEXT}</strong> below
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="reset" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={!form.formState.isValid || deleteProject.isLoading}
              >
                {deleteProject.isLoading && (
                  <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useDeleteProjectModal = ({
  project,
}: {
  project: Project;
}): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => (
      <DeleteProjectModal
        open={open}
        onOpenChange={setOpen}
        project={project}
      />
    ),
    [project, open]
  );

  return [open, setOpen, Modal];
};
