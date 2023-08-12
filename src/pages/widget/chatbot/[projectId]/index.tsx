import ThemeSwitcher from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatbotWidgetLayout from "@/layouts/chatbot-widget-layout";
import { useChatbotWidget } from "@/providers/chatbot-widget-provider";
import { type NextPageWithLayout } from "@/types/next";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Fragment, useState } from "react";

type UserMessage = {
  role: "user";
  content: string;
};
type AssistantMessage = {
  role: "assistant";
  content: string;
  urls?: string[];
};

type Message = UserMessage | AssistantMessage;

const Page: NextPageWithLayout = () => {
  const { project } = useChatbotWidget();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: message },
    ];
    setMessages(newMessages);
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
      console.log(data);
      setMessages([
        ...messages,
        { role: "assistant", content: data.message, urls: data.urls },
      ]);
    } catch (error) {
      console.log("Failed to generate message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto">
      <header className="sticky top-0 z-20 border-b bg-card/50 backdrop-blur-lg">
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
          {isLoading && (
            <div className="my-4 flex flex-col items-start">
              <div className="flex h-[44px] items-center gap-2 rounded-lg bg-secondary p-4 text-secondary-foreground">
                <div className="h-1 w-1 animate-pulse rounded-full bg-secondary-foreground ease-in-out" />
                <div className="h-1 w-1 animate-pulse rounded-full bg-secondary-foreground delay-100 ease-in-out" />
                <div className="h-1 w-1 animate-pulse rounded-full bg-secondary-foreground delay-200 ease-in-out" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-card/50 text-card-foreground backdrop-blur-lg">
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
          <Button size="icon">
            <Send />
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
      <div className="max-w-[90%] rounded-lg rounded-tr-none bg-primary p-4 text-primary-foreground">
        <p>{message.content}</p>
      </div>
    </div>
  );
};
const AssistantMessageBubble = ({ message }: { message: AssistantMessage }) => {
  return (
    <div className="my-4 flex flex-col items-start">
      <div className="max-w-[90%] rounded-lg rounded-tl-none bg-secondary p-4 text-secondary-foreground">
        <ReactMarkdown className="prose prose-zinc dark:prose-invert">
          {message.content}
        </ReactMarkdown>
        <div>
          <p>Sources: </p>
          {message.urls && (
            <ul>
              {message.urls.map((url) => (
                <li key={url}>{url}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
