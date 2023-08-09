import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  type CreateLinkData,
  createLinkSchema,
} from "@/lib/validations/create-link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DOMAIN } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { type Project } from "@/lib/schema/projects";
import { api } from "@/utils/api";
import ButtonLoadingSpinner from "@/components/button-loading-spinner";

const AddSingleLinkForm = ({
  onOpenChange,
  project,
}: {
  onOpenChange: (value: boolean) => void;
  project: Project;
}) => {
  const form = useForm<CreateLinkData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      url: "",
    },
  });
  const { toast } = useToast();
  const utils = api.useContext();
  const addLinks = api.link.addLinks.useMutation({
    onSuccess: () => {
      utils.link.getAll.invalidate({ projectId: project.id });
      onOpenChange(false);
      toast({ title: "Link added" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit(({ url }) =>
    addLinks.mutate({ projectId: project.id, data: { urls: [url] } })
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Url</FormLabel>
                <FormControl>
                  <Input placeholder={`https://${DOMAIN}`} {...field} />
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
            disabled={!form.formState.isValid || addLinks.isLoading}
          >
            {addLinks.isLoading && <ButtonLoadingSpinner />}
            Add Link
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
export default AddSingleLinkForm;
