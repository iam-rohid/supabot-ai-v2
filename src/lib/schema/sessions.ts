import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { type InferModel } from "drizzle-orm";

export const sessionsTable = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 })
    .notNull()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export type Session = InferModel<typeof sessionsTable>;
