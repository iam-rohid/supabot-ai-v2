import ThemeSwitcher from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatbotWidgetLayout from "@/layouts/chatbot-widget-layout";
import { useChatbotWidget } from "@/providers/chatbot-widget-provider";
import { type NextPageWithLayout } from "@/types/next";
import { Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

type UserMessage = {
  role: "user";
  content: string;
};

type AssistantMessage = {
  role: "assistant";
  content: string;
  sources?: string[];
};

type Message = UserMessage | AssistantMessage;

const Page: NextPageWithLayout = () => {
  const { project } = useChatbotWidget();
  const [messages, setMessages] = useState<Message[]>([
    ...(project.welcomeMessage
      ? [
          {
            role: "assistant",
            content: project.welcomeMessage,
          } satisfies AssistantMessage,
        ]
      : []),
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: message },
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
      setMessages([...newMessages, data]);
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
    <div
      ref={scrollBoxRef}
      className="relative flex flex-1 flex-col overflow-y-auto bg-background"
    >
      <header className="sticky top-0 z-20 border-b bg-background backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-screen-sm items-center px-4">
          <h1 className="tex-xl font-semibold">{project.name}</h1>
          <div className="flex-1"></div>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto max-w-screen-sm px-4">
          {messages.map((message, i) => (
            <Fragment key={i}>
              {message.role === "user" ? (
                <UserMessageBubble message={message} />
              ) : (
                <AssistantMessageBubble message={message} />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-background text-card-foreground backdrop-blur-lg">
        <form
          className="mx-auto flex h-16 w-full max-w-screen-sm items-center gap-4 px-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            type="text"
            className="flex-1"
            autoFocus
            placeholder="Send a message..."
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
          <Button disabled={isLoading} size="icon">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

Page.getLayout = (page) => <ChatbotWidgetLayout>{page}</ChatbotWidgetLayout>;

export default Page;

const UserMessageBubble = ({ message }: { message: UserMessage }) => {
  return (
    <div className="my-4 flex flex-col items-end">
      <div className="max-w-[90%]">
        <div className="rounded-xl rounded-br-sm bg-primary p-3 text-sm text-primary-foreground">
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

const AssistantMessageBubble = ({ message }: { message: AssistantMessage }) => {
  return (
    <div className="my-4 flex flex-col items-start">
      <div className="max-w-[90%]">
        <div className="rounded-xl rounded-bl-sm bg-secondary text-secondary-foreground">
          <ReactMarkdown className="prose prose-sm prose-zinc p-3 dark:prose-invert">
            {message.content}
          </ReactMarkdown>
        </div>
        {!!message.sources?.length && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">Learn More: </p>
            <div className="flex flex-wrap items-center gap-2">
              {message.sources.map((url, i) => (
                <Button
                  variant="secondary"
                  asChild
                  key={i}
                  size="sm"
                  className="h-7 px-2"
                >
                  <Link key={i} href={url} target="_blank">
                    <span className="truncate">
                      {i + 1}. {url}
                    </span>
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
