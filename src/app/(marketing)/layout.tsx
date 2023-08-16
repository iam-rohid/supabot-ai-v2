import NavLink from "@/components/nav-link";
import Link from "next/link";
import { type ReactNode } from "react";
import AuthButtonGroup from "./auth-button-group";
import Script from "next/script";
import FullLogo from "@/components/full-logo";
import Providers from "../providers";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="sticky top-0 bg-card text-card-foreground">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center">
                <Link
                  href="/home"
                  className="w-fit text-xl font-bold text-accent-foreground"
                >
                  <FullLogo className="text-2xl" />
                </Link>
              </div>
              <nav className="flex items-center gap-8 max-md:hidden">
                <NavLink
                  className="text-sm font-medium"
                  inactiveClassName="text-muted-foreground hover:text-accent-foreground"
                  activeClassName="text-accent-foreground"
                  href="/about"
                >
                  About
                </NavLink>
                <NavLink
                  className="text-sm font-medium"
                  inactiveClassName="text-muted-foreground hover:text-accent-foreground"
                  activeClassName="text-accent-foreground"
                  href="/blog"
                >
                  Blog
                </NavLink>
                <NavLink
                  className="text-sm font-medium"
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
        </Providers>
      </body>
    </html>
  );
}
