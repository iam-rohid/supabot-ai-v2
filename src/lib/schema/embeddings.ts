import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { linksTable } from "./links";
import { vector } from "pgvector/drizzle-orm";
import { OPENAI_EMBEDDING_DIMENSIONS } from "@/utils/constants";
import { type InferModel } from "drizzle-orm";
import { projectsTable } from "./projects";

export const embeddingsTable = pgTable("embeddings", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  linkId: uuid("link_id").references(() => linksTable.id, {
    onDelete: "cascade",
  }),
  projectId: uuid("project_id")
    .references(() => projectsTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", {
    dimensions: OPENAI_EMBEDDING_DIMENSIONS,
  }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export type Embedding = InferModel<typeof embeddingsTable>;
