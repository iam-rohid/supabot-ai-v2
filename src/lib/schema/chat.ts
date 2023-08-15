import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { type InferModel } from "drizzle-orm";

export const chatsTable = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: varchar("name", { length: 80 }),
  projectId: uuid("project_id")
    .references(() => projectsTable.id)
    .notNull(),
});

export type Chat = InferModel<typeof chatsTable>;
