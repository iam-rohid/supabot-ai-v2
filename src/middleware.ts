import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    if (req.nextauth.token?.sub && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (req.nextUrl.pathname === "/") {
      return NextResponse.rewrite(new URL("/home", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);
