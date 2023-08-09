import { useCallback, useState } from "react";
import { type UseModalReturning } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { api } from "@/utils/api";
import { projectInvitationSchema } from "@/lib/validations";
import { type z } from "zod";
import { DialogClose } from "@radix-ui/react-dialog";
import ButtonLoadingSpinner from "../button-loading-spinner";
import { type Project } from "@/lib/schema/projects";

export default function InviteTeammateMoal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}) {
  const form = useForm<z.infer<typeof projectInvitationSchema>>({
    resolver: zodResolver(projectInvitationSchema),
    defaultValues: {
      email: "",
    },
  });
  const { toast } = useToast();
  const utils = api.useContext();

  const inviteMember = api.project.invite.useMutation({
    onSuccess: () => {
      utils.project.getInvitations.invalidate({ projectId: project.id });
      toast({ title: "Invitations sent" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to sent invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) =>
    inviteMember.mutate({ projectId: project.id, data })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Teammate</DialogTitle>
          <DialogDescription>
            Invite a teammate to join your project. Invitations will be valid
            for 14 days.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="reset" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={inviteMember.isLoading || !form.formState.isValid}
              >
                {inviteMember.isLoading && <ButtonLoadingSpinner />}
                Invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useInviteTeammateModal = ({
  project,
}: {
  project: Project;
}): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => (
      <InviteTeammateMoal
        open={open}
        onOpenChange={setOpen}
        project={project}
      />
    ),
    [project, open]
  );

  return [open, setOpen, Modal];
};
