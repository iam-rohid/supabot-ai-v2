import { useCallback, useEffect, useState } from "react";
import { type UseModalReturning } from "./types";
import { useProject } from "@/providers/project-provider";
import { useForm } from "react-hook-form";
import { updateQuickPromptSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { DialogClose } from "@radix-ui/react-dialog";
import ButtonLoadingSpinner from "../button-loading-spinner";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { api } from "@/utils/api";
import { useToast } from "../ui/use-toast";
import { type QuickPrompt } from "@/lib/schema/quick-prompts";

export default function UpdateQuickPromptModal({
  open,
  onOpenChange,
  quickPrompt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quickPrompt: QuickPrompt;
}) {
  const { project } = useProject();
  const form = useForm<z.infer<typeof updateQuickPromptSchema>>({
    resolver: zodResolver(updateQuickPromptSchema),
    defaultValues: {
      id: quickPrompt.id,
      projectId: project.id,
      title: quickPrompt.title,
      prompt: quickPrompt.prompt,
    },
  });
  const utils = api.useContext();
  const { toast } = useToast();

  const addPrompt = api.quickPrompt.update.useMutation({
    onSuccess: async () => {
      await utils.quickPrompt.getAll.invalidate({ projectId: project.id });
      toast({ title: "Quick prompt updated" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update quick prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => addPrompt.mutate(data));

  useEffect(() => {
    form.setValue("projectId", project.id);
    form.setValue("id", quickPrompt.id);
  }, [form, project.id, quickPrompt.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Quick Prompt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Pricing Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Give me a detailed breackdown of the SupaBot AI pricing plan"
                        {...field}
                      />
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
              <Button type="submit" disabled={addPrompt.isLoading}>
                {addPrompt.isLoading && <ButtonLoadingSpinner />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useAddQuickPromptModal = ({
  quickPrompt,
}: {
  quickPrompt: QuickPrompt;
}): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => (
      <UpdateQuickPromptModal
        open={open}
        onOpenChange={setOpen}
        quickPrompt={quickPrompt}
      />
    ),
    [open, quickPrompt]
  );

  return [open, setOpen, Modal];
};
