import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, GithubIcon, Loader2Icon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string({ required_error: "Email is required" }).email(),
});
type SchemaData = z.infer<typeof schema>;

const SignInForm = () => {
  const form = useForm<SchemaData>({
    resolver: zodResolver(schema),
  });
  const [oauthSingInOpen, setOauthSingInOpen] = useState(false);
  const callbackUrl = "/dashboard";
  const { toast } = useToast();
  const isLoading = useMemo(
    () => form.formState.isSubmitting || oauthSingInOpen,
    [form.formState.isSubmitting, oauthSingInOpen]
  );

  const handleSubmit = useCallback(
    async ({ email }: SchemaData) => {
      try {
        const res = await signIn("email", {
          email,
          redirect: false,
          callbackUrl: callbackUrl ?? "/dashboard",
        });
        if (res?.error) {
          throw res?.error;
        }
        toast({
          title: "Email sent - check your inbox!",
        });
        form.reset();
      } catch (error) {
        toast({
          title: "Failed to send email!",
          variant: "destructive",
        });
      }
    },
    [callbackUrl, form, toast]
  );

  const handleSignInWithGithub = useCallback(async () => {
    setOauthSingInOpen(true);
    await signIn("github", {
      callbackUrl: callbackUrl ?? "/dashboard",
    });
  }, [callbackUrl]);

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} type="submit" className="w-full">
            {form.formState.isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue with Email
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <p className="text-sm text-muted-foreground">OR</p>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleSignInWithGithub}
        disabled={isLoading}
      >
        {oauthSingInOpen ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GithubIcon className="mr-2 text-xl" />
        )}
        Sign in with Github
      </Button>
    </div>
  );
};

export default SignInForm;
