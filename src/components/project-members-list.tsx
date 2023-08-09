import { api } from "@/utils/api";
import { format } from "date-fns";
import { UserIcon, MoreVertical } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import ButtonLoadingSpinner from "./button-loading-spinner";
import { Skeleton } from "./ui/skeleton";
import { type Project } from "@/lib/schema/projects";

export default function ProjectMembersList({ project }: { project: Project }) {
  const members = api.project.getMembers.useQuery({ projectId: project.id });
  const { toast } = useToast();
  const utils = api.useContext();
  const [memberIdToRemove, setMemberIdToRemove] = useState<string | null>();

  const removeMember = api.project.removeMember.useMutation({
    onSuccess: () => {
      setMemberIdToRemove(null);
      utils.project.getMembers.invalidate({ projectId: project.id });
      toast({ title: "Member removed" });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (members.isLoading) {
    return <Skeleton className="h-32" />;
  }
  if (members.isError) {
    return <p>Error</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>USER</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead>JOINED AT</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.data.map((member) => (
            <TableRow key={member.users.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        member.users.image || `/api/avatar/${member.users.id}`
                      }
                    />
                    <AvatarFallback>
                      <UserIcon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium leading-none">
                      {member.users.name || member.users.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.users.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="uppercase">
                {member.project_users.role}
              </TableCell>
              <TableCell>
                {format(
                  new Date(member.project_users.createdAt),
                  "MMM dd, yyyy"
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={removeMember.isLoading}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => setMemberIdToRemove(member.users.id)}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!memberIdToRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove a member from this project. Are you sure
              you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={removeMember.isLoading}
              onClick={() => setMemberIdToRemove(null)}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() =>
                memberIdToRemove
                  ? removeMember.mutate({
                      projectId: project.id,
                      userId: memberIdToRemove,
                    })
                  : undefined
              }
              disabled={removeMember.isLoading}
            >
              {removeMember.isLoading && <ButtonLoadingSpinner />}
              Remove Member
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
