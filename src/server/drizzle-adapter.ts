import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { accountsTable } from "@/lib/schema/accounts";
import { sessionsTable } from "@/lib/schema/sessions";
import { usersTable } from "@/lib/schema/users";
import { verificationTokensTable } from "@/lib/schema/verification-tokens";
import { type Adapter } from "next-auth/adapters";

export const drizzleAdapter: Adapter = {
  createUser: async (args) => {
    const [user] = await db.insert(usersTable).values(args).returning();
    if (!user) {
      throw "Failed to create user";
    }
    return user;
  },
  getUser: async (userId) => {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    return user ?? null;
  },
  getUserByEmail: async (email) => {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return user ?? null;
  },
  updateUser: async ({ id, ...rest }) => {
    const [user] = await db
      .update(usersTable)
      .set({
        ...rest,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();
    if (!user) {
      throw "Failed to update user";
    }
    return user;
  },
  deleteUser: async (userId) => {
    const [user] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning();
    return user ?? null;
  },
  createSession: async (data) => {
    const [session] = await db.insert(sessionsTable).values(data).returning();
    if (!session) {
      throw "Failed to create session";
    }
    return session;
  },
  updateSession: async ({ sessionToken, ...data }) => {
    const [session] = await db
      .update(sessionsTable)
      .set(data)
      .where(eq(sessionsTable.sessionToken, sessionToken))
      .returning();
    return session ?? null;
  },
  deleteSession: async (sessionToken) => {
    const [session] = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.sessionToken, sessionToken))
      .returning();
    return session ?? null;
  },
  getSessionAndUser: async (sessionToken) => {
    const [data] = await db
      .select()
      .from(sessionsTable)
      .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
      .where(eq(sessionsTable.sessionToken, sessionToken));
    return data
      ? {
          session: data.sessions,
          user: data.users,
        }
      : null;
  },
  linkAccount: async (data) => {
    const [account] = await db.insert(accountsTable).values(data).returning();
    if (!account) {
      throw "Failed to link account";
    }
    return {
      ...account,
      access_token: account.access_token ?? undefined,
      token_type: account.token_type ?? undefined,
      id_token: account.id_token ?? undefined,
      refresh_token: account.refresh_token ?? undefined,
      scope: account.scope ?? undefined,
      expires_at: account.expires_at ?? undefined,
      session_state: account.session_state ?? undefined,
    };
  },
  getUserByAccount: async (data) => {
    const [account] = await db
      .select()
      .from(accountsTable)
      .leftJoin(usersTable, eq(usersTable.id, accountsTable.userId))
      .where(
        and(
          eq(accountsTable.provider, data.provider),
          eq(accountsTable.providerAccountId, data.providerAccountId)
        )
      );
    if (!account) {
      return null;
    }
    return account.users;
  },
  unlinkAccount: async (data) => {
    const [account] = await db
      .delete(accountsTable)
      .where(
        and(
          eq(accountsTable.provider, data.provider),
          eq(accountsTable.providerAccountId, data.providerAccountId)
        )
      )
      .returning();
    if (!account) {
      throw "Failed to unlink account";
    }
    return {
      ...account,
      access_token: account.access_token ?? undefined,
      token_type: account.token_type ?? undefined,
      id_token: account.id_token ?? undefined,
      refresh_token: account.refresh_token ?? undefined,
      scope: account.scope ?? undefined,
      expires_at: account.expires_at ?? undefined,
      session_state: account.session_state ?? undefined,
    };
  },
  createVerificationToken: async (data) => {
    const [verificationToken] = await db
      .insert(verificationTokensTable)
      .values(data)
      .returning();
    return verificationToken ?? null;
  },
  useVerificationToken: async (data) => {
    const [verificationToken] = await db
      .delete(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.identifier, data.identifier),
          eq(verificationTokensTable.token, data.token)
        )
      )
      .returning();
    return verificationToken ?? null;
  },
};
