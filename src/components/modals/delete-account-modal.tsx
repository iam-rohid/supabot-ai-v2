import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { APP_NAME } from "@/utils/constants";
import { type UseModalReturning } from "./types";
import { z } from "zod";
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
import { api } from "@/utils/api";
import { DialogClose } from "@radix-ui/react-dialog";

const VERIFY_TEXT = "confirm delete account";

const schema = z.object({
  text: z.literal(VERIFY_TEXT),
});

export function DeleteAccountModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { update } = useSession();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const utils = api.useContext();
  const deleteUser = api.user.delete.useMutation({
    onSuccess: async () => {
      utils.invalidate();
      await update();
      toast({ title: "User deleted" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit(() => deleteUser.mutate());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Warning: This will permanently delete your account and all your{" "}
            {APP_NAME} links and their respective stats.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    To verfiy, type <strong>{VERIFY_TEXT}</strong> below
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="reset" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={deleteUser.isLoading || !form.formState.isValid}
                variant="destructive"
              >
                {deleteUser.isLoading && (
                  <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useDeleteAccountModal = (): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => <DeleteAccountModal open={open} onOpenChange={setOpen} />,
    [open]
  );

  return [open, setOpen, Modal];
};
