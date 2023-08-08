import { useCallback, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { type UseModalReturning } from "./types";
import { useSession } from "next-auth/react";

const VERIFY_MESSAGE = "confirm delete project";

export function DeleteProjectModal({
  open,
  onOpenChange,
  projectSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectSlug: string;
}) {
  const [projectSlugText, setProjectSlugText] = useState("");
  const [verifyText, setVerifyText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const handleDelete = useCallback(async () => {
    // if (
    //   isDeleting ||
    //   !(projectSlugText === projectSlug && verifyText === VERIFY_MESSAGE)
    // ) {
    //   return;
    // }
    // setIsDeleting(true);
    // try {
    //   await deleteProjectFn(projectSlug);
    //   queryClient.setQueryData<Project[]>(
    //     ["projects", session?.user.id],
    //     (projects) =>
    //       projects ? projects.filter((bot) => bot.slug !== projectSlug) : [],
    //   );
    //   router.refresh();
    //   router.push("/dashboard");
    //   toast({ title: "Project deleted successfully!" });
    //   setIsDeleting(false);
    // } catch (error) {
    //   setIsDeleting(false);
    //   toast({
    //     title: typeof error === "string" ? error : "Failed to delete project!",
    //     variant: "destructive",
    //   });
    // }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Warning: This will permanently delete your project and their
            respective stats.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <fieldset className="grid gap-2">
            <Label htmlFor="verify">
              Enter the project slug <strong>{projectSlug}</strong> to continue
            </Label>
            <Input
              value={projectSlugText}
              onChange={(e) => setProjectSlugText(e.currentTarget.value)}
            />
          </fieldset>
          <fieldset className="grid gap-2">
            <Label htmlFor="verify">
              To verify, type <strong>{VERIFY_MESSAGE}</strong> below
            </Label>
            <Input
              value={verifyText}
              onChange={(e) => setVerifyText(e.currentTarget.value)}
            />
          </fieldset>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={
              isDeleting ||
              !(
                verifyText === VERIFY_MESSAGE && projectSlugText === projectSlug
              )
            }
            onClick={handleDelete}
          >
            {isDeleting && (
              <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const useDeleteProjectModal = ({
  projectSlug,
}: {
  projectSlug: string;
}): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => (
      <DeleteProjectModal
        open={open}
        onOpenChange={setOpen}
        projectSlug={projectSlug}
      />
    ),
    [projectSlug, open]
  );

  return [open, setOpen, Modal];
};
