import { type InferModel } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const projectsTable = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    name: varchar("name", { length: 32 }).notNull(),
    slug: varchar("slug", { length: 32 }).notNull(),
    description: varchar("description", { length: 300 }),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    welcomeMessage: varchar("welcome_message", { length: 300 }),
    placeholderText: varchar("placeholder_text", { length: 100 }),
    theme: jsonb("theme").$type<Record<string, any>>().default({}).notNull(),
    customCss: text("custom_css"),
  },
  (table) => {
    return {
      slugKey: uniqueIndex().on(table.slug),
      nameIdx: index().on(table.name),
    };
  }
);

export type Project = InferModel<typeof projectsTable>;
