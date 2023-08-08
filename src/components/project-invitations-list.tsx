import { type Project } from "@prisma/client";
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

export default function ProjectInvitationsList({
  project,
}: {
  project: Project;
}) {
  const invitations = api.project.getInvitations.useQuery({ id: project.id });

  if (invitations.isLoading) {
    return <p>Loading...</p>;
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
        <InviteTeammateButton project={project} />
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
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
