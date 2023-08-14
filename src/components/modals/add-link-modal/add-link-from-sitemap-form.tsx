import { useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
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
import { BASE_URL } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/utils/api";
import ButtonLoadingSpinner from "@/components/button-loading-spinner";
import { useProject } from "@/providers/project-provider";

const sitemapSchema = z.object({
  sitemapUrl: z.string().url(),
});

type SitemapFormData = z.infer<typeof sitemapSchema>;

const AddLinksFromSitemapForm = ({
  onOpenChange,
}: {
  onOpenChange: (value: boolean) => void;
}) => {
  const { project } = useProject();
  const form = useForm<SitemapFormData>({
    resolver: zodResolver(sitemapSchema),
    defaultValues: {
      sitemapUrl: "",
    },
  });
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const { toast } = useToast();
  const utils = api.useContext();
  const addLinks = api.link.addLinks.useMutation({
    onSuccess: () => {
      utils.link.getAll.invalidate({ projectSlug: project.slug });
      onOpenChange(false);
      toast({ title: "Links added" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add links",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const fetchUrlsFromSitemap = api.link.fetchUrlsFromSitemap.useMutation({
    onMutate: () => {
      setUrls([]);
      setSelectedLinks([]);
    },
    onSuccess: (urls) => {
      setUrls(urls);
      setSelectedLinks([]);
      toast({
        title: "Sitemap fetch success",
        description: `${urls.length} urls has been fetched from this sitemap`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to fetch sitemap",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleSubmit = form.handleSubmit((data) =>
    fetchUrlsFromSitemap.mutate(data)
  );
  const handleAddLinks = () =>
    addLinks.mutate({
      projectSlug: project.slug,
      data: { urls: selectedLinks },
    });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="flex items-end gap-6">
              <FormField
                control={form.control}
                name="sitemapUrl"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Sitemap Url</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`${BASE_URL}/sitemap.xml`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || fetchUrlsFromSitemap.isLoading
                }
              >
                {fetchUrlsFromSitemap.isLoading && (
                  <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                )}
                Fetch Links
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <>
        {urls.length ? (
          <>
            <ScrollArea className="relative h-[288px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0">
                    <TableHead>
                      <Checkbox
                        checked={
                          urls.length > 0 &&
                          selectedLinks.length === urls.length
                        }
                        onCheckedChange={(value) => {
                          setSelectedLinks(value ? urls : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>Url</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((link) => (
                    <TableRow key={link}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLinks.includes(link)}
                          onCheckedChange={(value) => {
                            if (value) {
                              setSelectedLinks([...selectedLinks, link]);
                            } else {
                              setSelectedLinks(
                                selectedLinks.filter((slink) => slink !== link)
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{link}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md border py-16 text-sm text-muted-foreground">
            Empty List
          </div>
        )}
      </>

      <DialogFooter className="pt-6">
        {selectedLinks.length > 0 && (
          <p className="flex-1 truncate text-sm text-muted-foreground">
            Selected {selectedLinks.length} links
          </p>
        )}
        <Button
          type="reset"
          variant="ghost"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          disabled={selectedLinks.length === 0 || addLinks.isLoading}
          onClick={handleAddLinks}
        >
          {addLinks.isLoading && <ButtonLoadingSpinner />}
          Add Links
        </Button>
      </DialogFooter>
    </div>
  );
};
export default AddLinksFromSitemapForm;
