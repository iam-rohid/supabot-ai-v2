import ButtonLoadingSpinner from "@/components/button-loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const Invitation = () => {
  const router = useRouter();
  const slug = router.query.project_slug as string;
  const { toast } = useToast();

  const utils = api.useContext();
  const invitation = api.project.invitation.useQuery({
    projectSlug: slug,
  });
  const acceptInvitation = api.project.acceptInvitation.useMutation({
    onSuccess: () => {
      toast({ title: "Invitation accepted" });
      utils.project.getBySlug.invalidate({ projectSlug: slug });
      router.push(`/dashboard/${slug}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to accept invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hanldeAcceptInvitation = () => {
    if (invitation.data) {
      acceptInvitation.mutate({ projectId: invitation.data.projects.id });
    }
  };

  if (invitation.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (invitation.isError) {
    return <p>Error</p>;
  }

  if (!invitation.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>No invitation found</CardTitle>
            <CardDescription>
              Either you are not invited to this project or your invitation has
              been deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            You are invited to join {invitation.data.projects.name}
          </CardTitle>
          <CardDescription>
            Please click on accept to accept this invitation.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={hanldeAcceptInvitation}
            disabled={acceptInvitation.isLoading}
          >
            {acceptInvitation.isLoading && <ButtonLoadingSpinner />}
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Invitation;
