import { type Project } from "@prisma/client";
import { useInviteTeammateModal } from "./modals/invite-teammate-modal";
import { Button } from "./ui/button";

export default function InviteTeammateButton({
  project,
}: {
  project: Project;
}) {
  const [, setOpen, Modal] = useInviteTeammateModal({ project });
  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite Teammate</Button>
      <Modal />
    </>
  );
}
