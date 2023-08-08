import { Loader2 } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import {
  type CreateProjectSchemaData,
  createProjectSchema,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { type UseModalReturning } from "./types";
import { useSession } from "next-auth/react";
import { Project } from "@prisma/client";

const createProjectFn = async (data: CreateProjectSchemaData) => {
  // const res = await fetch("/api/projects", {
  //   method: "POST",
  //   body: JSON.stringify(data),
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  // const body: ApiResponse<Project> = await res.json();
  // if (!body.success) {
  //   throw body.error;
  // }
  // return body.data;
};

export function CreateProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const form = useForm<CreateProjectSchemaData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSubmit = useCallback(
    async (data: CreateProjectSchemaData) => {
      // try {
      //   const project = await createProjectFn(data);
      //   queryClient.setQueryData<Project[]>(
      //     ["projects", session?.user.id],
      //     (projects) => (projects ? [...projects, project] : [project]),
      //   );
      //   router.refresh();
      //   router.push(`/dashboard/${project.slug}`);
      //   onOpenChange(false);
      //   toast({ title: "Project created successfully!" });
      // } catch (error) {
      //   toast({
      //     title:
      //       typeof error === "string" ? error : "Failed to create project!",
      //     variant: "destructive",
      //   });
      // }
    },
    [onOpenChange, queryClient, router, session?.user.id, toast]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
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
                      <Input placeholder="my-bot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="reset"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                )}
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
