import NavLink from "@/components/nav-link";
import { APP_NAME } from "@/utils/constants";
import Link from "next/link";
import { type ReactNode } from "react";
import AuthButtonGroup from "./auth-button-group";
import Script from "next/script";

// export const runtime = "edge";
export const revalidate = 60 * 60 * 24; // One day of caching

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="bg-card text-card-foreground">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex-1">
            <Link
              href="/home"
              className="text-xl font-bold text-accent-foreground"
            >
              {APP_NAME}
            </Link>
          </div>
          <nav className="flex items-center gap-8 max-md:hidden">
            <NavLink
              className="text-sm font-medium"
              inactiveClassName="text-muted-foreground hover:text-accent-foreground"
              activeClassName="text-accent-foreground"
              href="/about"
              prefetch={false}
            >
              About
            </NavLink>
            <NavLink
              className="text-sm font-medium"
              inactiveClassName="text-muted-foreground hover:text-accent-foreground"
              activeClassName="text-accent-foreground"
              href="/blog"
              prefetch={false}
            >
              Blog
            </NavLink>
            <NavLink
              className="text-sm font-medium"
              inactiveClassName="text-muted-foreground hover:text-accent-foreground"
              activeClassName="text-accent-foreground"
              href="/pricing"
              prefetch={false}
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
