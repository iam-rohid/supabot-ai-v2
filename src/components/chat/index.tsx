import { Button } from "@/components/ui/button";
import { useChatbotWidget } from "@/providers/chatbot-widget-provider";
import { Loader2, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Message } from "./types";
import { api } from "@/utils/api";
import TextareaAutosize from "react-textarea-autosize";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { cn } from "@/utils";

export default function Chatbox() {
  const { project } = useChatbotWidget();
  const [messages, setMessages] = useState<Message[]>([
    ...(project.welcomeMessage
      ? [
          {
            role: "assistant",
            content: project.welcomeMessage,
            isWelcomeMessage: true,
            date: new Date(),
          } satisfies Message,
        ]
      : []),
  ]);
  const quickPrompts = api.quickPrompt.getAll.useQuery({
    projectId: project.id,
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (message: string) => {
    if (!message.trim()) {
      return;
    }
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: message, date: new Date() },
    ];
    setMessages(newMessages);
    setMessage("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        body: JSON.stringify({
          messages: newMessages,
          projectId: project.id,
        }),
      });
      if (!res.ok) {
        throw res.statusText;
      }
      const data = await res.json();
      setMessages([...newMessages, { ...data, date: new Date() }]);
    } catch (error) {
      console.log("Failed to generate message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollBoxRef.current?.scrollTo({
      behavior: "smooth",
      top: scrollBoxRef.current.scrollHeight,
    });
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto" ref={scrollBoxRef}>
        {messages.map((message, i) => (
          <MessageItem key={i} message={message} />
        ))}
      </div>

      {messages.findIndex((p) => p.role === "user") === -1 && (
        <div className="container flex flex-wrap justify-end gap-4 py-4">
          {quickPrompts.data?.map((prompt) => (
            <Button
              key={prompt.id}
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(prompt.prompt)}
            >
              {prompt.title}
            </Button>
          ))}
        </div>
      )}

      <div className="border-t bg-card text-card-foreground backdrop-blur-lg">
        <form
          className="flex items-center gap-2 p-0"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(message);
          }}
        >
          <TextareaAutosize
            className="flex-1 resize-none p-4 outline-none"
            autoFocus
            placeholder={project.placeholderText || "Send a message..."}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            minRows={1}
            maxRows={5}
            onKeyDown={(e) => {
              if (e.code === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(message);
              }
            }}
          />
          <div className="flex items-center pr-4">
            <Button disabled={isLoading} size="icon" variant="ghost">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

const MessageItem = ({ message }: { message: Message }) => {
  return (
    <div
      className={cn(
        "my-4 flex flex-col gap-2 px-4",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[90%] flex-col items-start space-y-1",
          message.role === "user" ? "items-end" : "items-start"
        )}
      >
        <p className="text-sm text-muted-foreground">
          {message.role === "user" ? "You" : "Chatbot"}{" "}
          {format(message.date, "p")}
        </p>
        <div
          className={cn(
            "rounded-2xl shadow-sm",
            message.role === "user"
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-card text-card-foreground"
          )}
        >
          <ReactMarkdown
            className={cn(
              "p-4",
              message.role === "user"
                ? "prose-invert"
                : "prose dark:prose-invert"
            )}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.role === "assistant" && !!message.sources?.length && (
          <div className="space-y-1 pt-1">
            <p className="text-sm text-muted-foreground">Learn More: </p>
            <div className="flex flex-wrap items-center gap-1">
              {message.sources.map((url, i) => (
                <Button
                  variant="secondary"
                  asChild
                  key={i}
                  size="sm"
                  className="h-7 border bg-card px-2 text-primary"
                >
                  <Link key={i} href={url} target="_blank">
                    <span className="truncate">{url}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
