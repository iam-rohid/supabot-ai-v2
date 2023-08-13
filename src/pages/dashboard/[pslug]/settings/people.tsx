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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader className="flex-row items-center space-x-6 space-y-0">
        <div className="flex-1 space-y-1.5">
          <CardTitle>People</CardTitle>
          <CardDescription>
            Teammates or friends that have access to this project.
          </CardDescription>
        </div>
        <InviteTeammateButton />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <ProjectMembersList />
          </TabsContent>
          <TabsContent value="invitations">
            <ProjectInvitationsList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
