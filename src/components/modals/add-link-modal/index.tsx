import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { type UseModalReturning } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { type Project } from "@/lib/schema/projects";
import AddSingleLinkForm from "./add-single-link-form";
import AddLinksFromSitemapForm from "./add-link-from-sitemap-form";

export function AddLinkModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="url">
          <TabsList>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <AddSingleLinkForm onOpenChange={onOpenChange} project={project} />
          </TabsContent>
          <TabsContent value="sitemap">
            <AddLinksFromSitemapForm
              onOpenChange={onOpenChange}
              project={project}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export const useAddLinkModal = ({
  project,
}: {
  project: Project;
}): UseModalReturning => {
  const [open, setOpen] = useState(false);
  const Modal = useCallback(
    () => <AddLinkModal open={open} onOpenChange={setOpen} project={project} />,
    [project, open]
  );
  return [open, setOpen, Modal];
};
