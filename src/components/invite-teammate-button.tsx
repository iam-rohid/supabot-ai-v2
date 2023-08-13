import { useInviteTeammateModal } from "./modals/invite-teammate-modal";
import { Button } from "./ui/button";

export default function InviteTeammateButton() {
  const [, setOpen, Modal] = useInviteTeammateModal();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite Teammate</Button>
      <Modal />
    </>
  );
}
