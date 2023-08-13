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
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/utils/api";
import { APP_NAME, DOMAIN } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ButtonLoadingSpinner from "../button-loading-spinner";
import { useEffect } from "react";
import { useProject } from "@/providers/project-provider";

const updateSlugSchema = z.object({
  slug: z
    .string({ required_error: "Project slug is required" })
    .min(1, "Project slug is required")
    .max(32),
});

type UpdateSlugFormData = z.infer<typeof updateSlugSchema>;

export default function UpdateProjectSlugForm() {
  const { project } = useProject();

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
        query: { pslug: data.slug },
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

  useEffect(() => {
    form.setValue("slug", project.slug);
  }, [form, project.slug]);

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
