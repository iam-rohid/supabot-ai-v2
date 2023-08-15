import { createChatSchema } from "@/lib/validations";
import {
  createTRPCRouter,
  projectExistsProcedure,
  publicProcedure,
} from "../trpc";
import { chatsTable } from "@/lib/schema/chat";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  create: publicProcedure
    .input(createChatSchema)
    .mutation(async ({ ctx, input }) => {
      const [chat] = await ctx.db
        .insert(chatsTable)
        .values({ projectId: input.projectId })
        .returning();
      if (!chat) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return chat;
    }),
  findOne: projectExistsProcedure
    .input(z.object({ chatId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [chat] = await ctx.db
        .select()
        .from(chatsTable)
        .where(
          and(
            eq(chatsTable.id, input.chatId),
            eq(chatsTable.projectId, input.projectId)
          )
        );
      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found!" });
      }
      return chat;
    }),
});
