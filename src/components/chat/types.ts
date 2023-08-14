export type UserMessage = {
  role: "user";
  content: string;
  date: Date;
};

export type AssistantMessage = {
  role: "assistant";
  content: string;
  sources?: string[];
  isWelcomeMessage?: boolean;
  date: Date;
};

export type Message = UserMessage | AssistantMessage;
