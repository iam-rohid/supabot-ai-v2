import { api } from "@/utils/api";
import { type Project } from "@prisma/client";
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

export default function ProjectMembersList({ project }: { project: Project }) {
  const members = api.project.getMembers.useQuery({ id: project.id });

  if (members.isLoading) {
    return <p>Loading...</p>;
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
            <TableRow key={member.userId}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={member.user.image || `/api/avatar/${member.userId}`}
                    />
                    <AvatarFallback>
                      <UserIcon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium leading-none">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="uppercase">{member.role}</TableCell>
              <TableCell>
                {format(new Date(member.createdAt), "MMM dd, yyyy")}
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
