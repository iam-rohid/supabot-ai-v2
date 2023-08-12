import { projectRouter } from "@/server/api/routers/project";
import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { linkRouter } from "./routers/link";
import { chatbotRouter } from "./routers/chatbot-widget";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  link: linkRouter,
  chatbot: chatbotRouter,
});

export type AppRouter = typeof appRouter;
