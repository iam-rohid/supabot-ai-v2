import InviteTeammateButton from "@/components/invite-teammate-button";
import ProjectInvitationsList from "@/components/project-invitations-list";
import ProjectMembersList from "@/components/project-members-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";

const Page: NextPageWithLayout = () => {
  const {
    query: { project_slug },
  } = useRouter();
  const project = api.project.getBySlug.useQuery({
    projectSlug: project_slug as string,
  });
  if (project.isLoading) {
    return <Skeleton className="h-[400px]"></Skeleton>;
  }
  if (project.isError) {
    return <p>Error</p>;
  }
  if (!project.data) {
    return <p>Project not found</p>;
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center space-x-6 space-y-0">
        <div className="flex-1 space-y-1.5">
          <CardTitle>People</CardTitle>
          <CardDescription>
            Teammates or friends that have access to this project.
          </CardDescription>
        </div>
        <InviteTeammateButton project={project.data} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <ProjectMembersList project={project.data} />
          </TabsContent>
          <TabsContent value="invitations">
            <ProjectInvitationsList project={project.data} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
