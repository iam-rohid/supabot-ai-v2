import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import { createHash } from "crypto";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      sendVerificationRequest: ({ url }) => {
        console.log("Log In Link: ", url);
      },
    }),
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    jwt: async ({ token, trigger }) => {
      if (!token.email && token.sub) {
        return {};
      }
      if (trigger) {
        const user = await prisma.user.findUnique({ where: { id: token.sub } });
        if (!user) {
          return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        session.user.role = token.role;
        session.user.image = token.picture;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const hashToken = (token: string) => {
  return createHash("sha256")
    .update(`${token}${process.env.NEXTAUTH_SECRET}`)
    .digest("hex");
};
