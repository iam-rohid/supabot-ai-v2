"use client";

import ButtonLoadingSpinner from "@/components/button-loading-spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createChatSchema } from "@/lib/validations";
import axios, { AxiosError } from "axios";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export default function StartConversationButton({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      const payload = createChatSchema.parse({
        projectId,
      });
      const { data } = await axios.post("/api/chat", payload);
      router.push(`/widget/chatbox/${projectId}/${data.id}`);
    } catch (error) {
      let message = "Something went wrong!";
      if (error instanceof z.ZodError) {
        message = error.message;
      } else if (error instanceof AxiosError) {
        message = error.response?.data;
      }
      toast({
        title: "Failed to start a new conversation",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStartConversation} disabled={isLoading}>
      {isLoading ? (
        <>
          <ButtonLoadingSpinner />
          Please wait
        </>
      ) : (
        <>
          Start a Conversation
          <ArrowRight className="-mr-1 ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
