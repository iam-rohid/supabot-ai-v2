import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { type UseModalReturning } from "./types";
import { api } from "@/utils/api";
import {
  type CreateProjectSchemaData,
  createProjectSchema,
} from "@/lib/validations";
import { DialogClose } from "@radix-ui/react-dialog";
import ButtonLoadingSpinner from "../button-loading-spinner";
import { APP_NAME, DOMAIN } from "@/utils/constants";

export function CreateProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<CreateProjectSchemaData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useContext();

  const createProject = api.project.create.useMutation({
    onSuccess: async (data) => {
      await utils.project.getAll.invalidate();
      toast({ title: "Project Created" });
      onOpenChange(false);
      router.push(`/dashboard/${data.project.slug}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create Project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => createProject.mutate(data));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Bot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Slug</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <div className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm font-medium text-muted-foreground">
                          {DOMAIN}/dashboard/
                        </div>
                        <Input
                          placeholder="my-bot"
                          className="flex-1 rounded-l-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This is your project&apos;s unique slug on {APP_NAME}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="reset" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createProject.isLoading}>
                {createProject.isLoading && <ButtonLoadingSpinner />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useCreateProjectModal = (): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => <CreateProjectModal open={open} onOpenChange={setOpen} />,
    [open]
  );

  return [open, setOpen, Modal];
};
