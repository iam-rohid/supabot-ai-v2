import { projectRouter } from "@/server/api/routers/project";
import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { linkRouter } from "./routers/link";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  link: linkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
