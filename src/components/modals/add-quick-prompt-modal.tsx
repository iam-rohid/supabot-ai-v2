import { useCallback, useEffect, useState } from "react";
import { type UseModalReturning } from "./types";
import { useProject } from "@/providers/project-provider";
import { useForm } from "react-hook-form";
import { createQuickPromptSchema } from "@/lib/validations";
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

export default function AddQuickPromptModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { project } = useProject();
  const form = useForm<z.infer<typeof createQuickPromptSchema>>({
    resolver: zodResolver(createQuickPromptSchema),
    defaultValues: {
      projectId: project.id,
      prompt: "",
      title: "",
    },
  });
  const utils = api.useContext();
  const { toast } = useToast();

  const addPrompt = api.quickPrompt.create.useMutation({
    onSuccess: async () => {
      await utils.quickPrompt.getAll.invalidate({ projectId: project.id });
      toast({ title: "Quick prompt added" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add quick prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => addPrompt.mutate(data));

  useEffect(() => {
    form.setValue("projectId", project.id);
  }, [form, project.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Quick Prompt</DialogTitle>
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
                Add Quick Prompt
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useAddQuickPromptModal = (): UseModalReturning => {
  const [open, setOpen] = useState(false);

  const Modal = useCallback(
    () => <AddQuickPromptModal open={open} onOpenChange={setOpen} />,
    [open]
  );

  return [open, setOpen, Modal];
};
