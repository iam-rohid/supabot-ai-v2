import InviteTeammateButton from "./invite-teammate-button";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import { Skeleton } from "./ui/skeleton";
import { useProject } from "@/providers/project-provider";

export default function ProjectInvitationsList() {
  const { project } = useProject();
  const { toast } = useToast();
  const invitations = api.project.getInvitations.useQuery({
    projectId: project.id,
  });
  const utils = api.useContext();
  const deleteInvitation = api.project.deleteInvitation.useMutation({
    onSuccess: () => {
      utils.project.getInvitations.invalidate({ projectId: project.id });
      toast({ title: "Invitation deleted" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (invitations.isLoading) {
    return <Skeleton className="h-32" />;
  }
  if (invitations.isError) {
    return <p>Error</p>;
  }

  if (invitations.data.length === 0) {
    return (
      <div className="space-y-6 p-6 text-center">
        <p className="text-muted-foreground">
          You haven&apos;t invited anyone yet!
        </p>
        <InviteTeammateButton />
      </div>
    );
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>EMAIL</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead>INVITED AT</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.data.map((invitation) => (
            <TableRow key={invitation.email}>
              <TableCell>{invitation.email}</TableCell>
              <TableCell className="uppercase">{invitation.role}</TableCell>
              <TableCell>
                {format(new Date(invitation.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteInvitation.isLoading}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        deleteInvitation.mutate({
                          projectId: project.id,
                          data: { email: invitation.email },
                        })
                      }
                    >
                      Delete Invitation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
