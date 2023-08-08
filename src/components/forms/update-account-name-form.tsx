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
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(32),
});
type FormData = z.infer<typeof schema>;

export default function UpdateAccountNameForm() {
  const { data: session } = useSession();
  const { update } = useSession();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: session?.user.name || "",
    },
  });
  const { toast } = useToast();

  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      await update();
      toast({ title: "Name update success" });
    },
    onError: (error) => {
      toast({ title: error.message });
    },
  });

  const handleSubmit = form.handleSubmit((data) =>
    updateUser.mutate({ name: data.name })
  );

  useEffect(() => {
    if (session?.user.name) {
      form.setValue("name", session.user.name);
    }
  }, [session?.user.name, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Name</CardTitle>
        <CardDescription>
          This will be your display name on {APP_NAME}
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>Max 32 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={!form.formState.isDirty || updateUser.isLoading}>
              {updateUser.isLoading && (
                <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
