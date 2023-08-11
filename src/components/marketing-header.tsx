import { APP_NAME, HOME_DOMAIN } from "@/utils/constants";
import Link from "next/link";
import React from "react";
import NavLink from "./nav-link";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export default function MarketingHeader() {
  return (
    <header className="bg-card text-card-foreground">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex-1">
          <Link href="/" className="text-xl font-bold text-accent-foreground">
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
  );
}

function AuthButtonGroup() {
  const { status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-10 w-24" />;
  }

  if (status === "authenticated") {
    return (
      <Button asChild>
        <Link href="/dashboard">
          Dashboard
          <ChevronRight className="-mr-1 ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-x-2">
      <Button variant="ghost" asChild>
        <Link href="/signin">Sign In</Link>
      </Button>
      <Button>
        <Link
          href={{
            pathname: "/signin",
            query: new URLSearchParams({
              next: "/pricing",
            }).toString(),
          }}
        >
          Get Started
        </Link>
      </Button>
    </div>
  );
}
