import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/utils/api";
import { APP_NAME } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ButtonLoadingSpinner from "../button-loading-spinner";
import { type Project } from "@/lib/schema/projects";

const updateSlugSchema = z.object({
  slug: z
    .string({ required_error: "Project slug is required" })
    .min(1, "Project slug is required")
    .max(32),
});

type UpdateSlugFormData = z.infer<typeof updateSlugSchema>;

export default function UpdateProjectSlugForm({
  project,
}: {
  project: Project;
}) {
  const form = useForm<UpdateSlugFormData>({
    resolver: zodResolver(updateSlugSchema),
    defaultValues: { slug: project.slug },
  });
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useContext();

  const updateProject = api.project.update.useMutation({
    onSuccess: (data) => {
      utils.project.getAll.invalidate();
      toast({ title: "Project slug updated" });
      router.push({
        pathname: router.pathname,
        query: { project_slug: data.slug },
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update project slug",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) =>
    updateProject.mutate({ projectId: project.id, data })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Slug</CardTitle>
        <CardDescription>
          This is your project&apos;s unique slug on {APP_NAME}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-bot" {...field} />
                  </FormControl>
                  <FormDescription>Max 32 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting && <ButtonLoadingSpinner />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
