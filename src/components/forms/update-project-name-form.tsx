"use client";

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
import { APP_NAME } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ButtonLoadingSpinner from "../button-loading-spinner";
import { useProject } from "@/providers/project-provider";
import { useEffect } from "react";

const updateNameSchema = z.object({
  name: z
    .string({ required_error: "Project Name is required" })
    .min(1, "Project Name is required")
    .max(32),
});

type UpateNameFormData = z.infer<typeof updateNameSchema>;

export default function UpdateProjecNameForm() {
  const { project } = useProject();
  const form = useForm<UpateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: project.name || "",
    },
  });
  const { toast } = useToast();
  const utils = api.useContext();

  const updateProject = api.project.update.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      utils.project.getBySlug.invalidate({ projectSlug: project.slug });
      toast({ title: "Project name updated" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update project name",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) =>
    updateProject.mutate({ projectId: project.id, data })
  );

  useEffect(() => {
    form.setValue("name", project.name);
  }, [form, project.name]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Name</CardTitle>
        <CardDescription>
          This is the name of your project on {APP_NAME}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="My Bot" {...field} />
                  </FormControl>
                  <FormDescription>Max 32 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={updateProject.isLoading || !form.formState.isDirty}
            >
              {updateProject.isLoading && <ButtonLoadingSpinner />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
