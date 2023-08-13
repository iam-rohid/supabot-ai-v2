import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { type InferModel } from "drizzle-orm";

export const quickPromptsTable = pgTable(
  "quick_prompts",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    title: varchar("title", { length: 80 }).notNull(),
    prompt: varchar("prompt", { length: 500 }).notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    titleIdx: index().on(table.title),
    createdIdx: index().on(table.createdAt),
    updatedIdx: index().on(table.updatedAt),
  })
);

export type QuickPrompt = InferModel<typeof quickPromptsTable>;
