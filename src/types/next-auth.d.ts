import { type DefaultSession } from "next-auth";
import { type UserRole } from "@/lib/schema/users";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role?: UserRole | null | undefined;
    };
  }

  interface User {
    role?: UserRole | null | undefined | undefined;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | null | undefined;
  }
}
