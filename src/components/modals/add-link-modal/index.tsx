import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { type UseModalReturning } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import AddSingleLinkForm from "./add-single-link-form";
import AddLinksFromSitemapForm from "./add-link-from-sitemap-form";

export function AddLinkModal({
  open,
  onOpenChange,
  projectSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectSlug: string;
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
            <AddSingleLinkForm
              onOpenChange={onOpenChange}
              projectSlug={projectSlug}
            />
          </TabsContent>
          <TabsContent value="sitemap">
            <AddLinksFromSitemapForm
              onOpenChange={onOpenChange}
              projectSlug={projectSlug}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export const useAddLinkModal = ({
  projectSlug,
}: {
  projectSlug: string;
}): UseModalReturning => {
  const [open, setOpen] = useState(false);
  const Modal = useCallback(
    () => (
      <AddLinkModal
        open={open}
        onOpenChange={setOpen}
        projectSlug={projectSlug}
      />
    ),
    [projectSlug, open]
  );
  return [open, setOpen, Modal];
};
