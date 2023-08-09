import {
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { usersTable } from "./users";
import { type InferModel } from "drizzle-orm";

export const projectUserRole = pgEnum("project_user_role", [
  "owner",
  "admin",
  "member",
]);

export type ProjectUserRole = (typeof projectUserRole.enumValues)[number];

export const projectUsersTable = pgTable(
  "project_users",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: projectUserRole("role").default("member").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.projectId, table.userId),
    };
  }
);

export type ProjectUser = InferModel<typeof projectUsersTable>;
