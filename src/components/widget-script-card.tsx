import { useProject } from "@/providers/project-provider";
import { CHATBOT_WIDGET_SCRIPT_URL } from "@/utils/constants";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Highlight from "react-highlight";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";

export default function WidgetScriptCard() {
  const { project } = useProject();
  const scriptTag = useMemo(
    () =>
      `<script async src="${CHATBOT_WIDGET_SCRIPT_URL}" data-id="${project.id}"  data-name="SB-ChatBox" data-color="#5F7FFF" data-position="right" data-x-margin="20" data-y-margin="20"></script>`,
    [project.id]
  );

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copied) {
      return;
    }
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Widget Code</CardTitle>
        <CardDescription>
          Copy and paste this code inside your HTML head tag.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Highlight className="xml whitespace-pre-wrap rounded-md pr-10">
          {scriptTag}
        </Highlight>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy}>
          {copied ? (
            <Check className="-ml-1 mr-2 h-4 w-4" />
          ) : (
            <Copy className="-ml-1 mr-2 h-4 w-4" />
          )}
          Copy Code
        </Button>
      </CardFooter>
    </Card>
  );
}
