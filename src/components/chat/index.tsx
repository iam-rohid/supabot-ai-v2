"use client";

import { Button } from "@/components/ui/button";
import { Loader2, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { cn } from "@/utils";
import { type QuickPrompt } from "@/lib/schema/quick-prompts";
import { type Message } from "@/lib/schema/messages";
import { type Chat } from "@/lib/schema/chat";
import { type Project } from "@/lib/schema/projects";
import Link from "next/link";
import axios from "axios";

export default function Chatbox({
  quickPrompts,
  messages: initMessages,
  chat,
  project,
}: {
  quickPrompts: QuickPrompt[];
  messages: Message[];
  chat: Chat;
  project: Project;
}) {
  const [messages, setMessages] = useState<Message[]>(initMessages);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      return;
    }
    const newMessages: Message[] = [
      ...messages,
      {
        id: "user_message",
        role: "user",
        content: message,
        createdAt: new Date(),
        chatId: chat.id,
        metadata: {},
      },
    ];
    setMessages(newMessages);
    setMessage("");
    setIsLoading(true);
    try {
      const {
        data: { userMessage, assistantMessage },
      } = await axios.post(`/api/chat/${chat.id}`, { message });

      setMessages([
        ...newMessages.map((message) =>
          message.id === "user_message" ? userMessage : message
        ),
        assistantMessage,
      ]);
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
        {project.welcomeMessage && (
          <MessageItem content={project.welcomeMessage} role="assistant" />
        )}
        {messages.map((message, i) => (
          <MessageItem
            key={i}
            content={message.content}
            role={message.role}
            sentAt={message.createdAt}
          />
        ))}
      </div>

      {!!quickPrompts.length &&
        messages.findIndex((p) => p.role === "user") === -1 && (
          <div className="container flex flex-wrap justify-end gap-4 py-4">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.id}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(prompt.prompt)}
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
            sendMessage(message);
          }}
        >
          <TextareaAutosize
            className="flex-1 resize-none bg-transparent p-4 outline-none"
            autoFocus
            placeholder={project.placeholderText || "Send a message..."}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            minRows={1}
            maxRows={5}
            onKeyDown={(e) => {
              if (e.code === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(message);
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

const MessageItem = ({
  role,
  content,
  sentAt,
  sources,
}: {
  role: Message["role"];
  content: string;
  sentAt?: Date;
  sources?: string[];
}) => {
  return (
    <div
      className={cn(
        "my-4 flex flex-col gap-2 px-4",
        role === "user" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[90%] flex-col items-start space-y-1",
          role === "user" ? "items-end" : "items-start"
        )}
      >
        <p className="text-sm">
          {role === "user" ? "You" : "Chatbot"}{" "}
          {sentAt && (
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(sentAt), { addSuffix: true })}
            </span>
          )}
        </p>
        <div
          className={cn(
            "rounded-2xl",
            role === "user"
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-secondary text-secondary-foreground"
          )}
        >
          <ReactMarkdown
            className={cn(
              "p-4",
              role === "user" ? "prose-invert" : "prose dark:prose-invert"
            )}
          >
            {content}
          </ReactMarkdown>
        </div>
        {!!sources?.length && (
          <div className="space-y-1 pt-1">
            <p className="text-sm text-muted-foreground">Learn More: </p>
            <div className="flex flex-wrap items-center gap-1">
              {sources.map((url, i) => (
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
