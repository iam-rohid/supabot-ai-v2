import NavLink from "@/components/nav-link";
import { APP_NAME } from "@/utils/constants";
import Link from "next/link";
import { type ReactNode } from "react";
import AuthButtonGroup from "./auth-button-group";

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
    </>
  );
}
