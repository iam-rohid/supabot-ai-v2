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
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ButtonLoadingSpinner from "../button-loading-spinner";

const schema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email(),
});

type FormData = z.infer<typeof schema>;

export default function UpdateAccountEmailForm() {
  const { data: session } = useSession();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: session?.user.email || "",
    },
  });
  const { update } = useSession();
  const { toast } = useToast();

  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      await update();
      toast({ title: "Email update success" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) =>
    updateUser.mutate({ email: data.email })
  );

  useEffect(() => {
    if (session?.user.email) {
      form.setValue("email", session.user.email);
    }
  }, [session?.user.email, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Email</CardTitle>
        <CardDescription>
          This will be the email you use to log in to {APP_NAME} and receive
          notifications.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be a valid email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={!form.formState.isDirty || updateUser.isLoading}>
              {updateUser.isLoading && <ButtonLoadingSpinner />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
