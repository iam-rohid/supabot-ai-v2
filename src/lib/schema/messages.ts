import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { chatsTable } from "./chat";
import { type InferModel } from "drizzle-orm";

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    content: text("content").notNull(),
    chatId: uuid("chat_id")
      .references(() => chatsTable.id)
      .notNull(),
    role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, any>>()
      .default({})
      .notNull(),
  },
  (t) => ({
    creatdAtIdx: index().on(t.createdAt),
  })
);

export type Message = InferModel<typeof messagesTable>;
