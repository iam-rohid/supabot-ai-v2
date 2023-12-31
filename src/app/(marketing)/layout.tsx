import NavLink from "@/components/nav-link";
import Link from "next/link";
import { type ReactNode } from "react";
import AuthButtonGroup from "./auth-button-group";
import Script from "next/script";
import FullLogo from "@/components/full-logo";
import { type Metadata } from "next";
import { APP_NAME } from "@/utils/constants";

export const metadata: Metadata = {
  title: APP_NAME,
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-card text-card-foreground">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center">
            <Link
              href="/home"
              className="w-fit text-xl font-bold text-accent-foreground"
            >
              <FullLogo className="h-8" />
            </Link>
          </div>
          <nav className="flex items-center gap-8 max-md:hidden">
            <NavLink
              className="font-medium"
              inactiveClassName="text-muted-foreground hover:text-accent-foreground"
              activeClassName="text-accent-foreground"
              href="/about"
            >
              About
            </NavLink>
            <NavLink
              className="font-medium"
              inactiveClassName="text-muted-foreground hover:text-accent-foreground"
              activeClassName="text-accent-foreground"
              href="/blog"
            >
              Blog
            </NavLink>
            <NavLink
              className="font-medium"
              inactiveClassName="text-muted-foreground hover:text-accent-foreground"
              activeClassName="text-accent-foreground"
              href="/pricing"
            >
              Pricing
            </NavLink>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-6">
            <AuthButtonGroup />
          </div>
        </div>
      </header>

      {children}

      <Script
        async
        src="https://supabotai.com/chatbot-widget.js"
        data-id="5f3ae903-a13f-43ea-88ee-5387b7416ff2"
        data-name="SB-ChatBox"
        strategy="lazyOnload"
      ></Script>
    </>
  );
}
