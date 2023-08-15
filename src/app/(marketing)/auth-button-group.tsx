"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButtonGroup() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-10 w-[124px]" />;
  }

  if (data) {
    return (
      <Button asChild>
        <Link href="/dashboard" prefetch={false}>
          Dashboard
          <ChevronRight className="-mr-1 ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-x-2">
      <Button variant="ghost" asChild>
        <Link href="/signin" prefetch={false}>
          Sign In
        </Link>
      </Button>
      <Button asChild>
        <Link
          href={{
            pathname: "/signin",
            query: new URLSearchParams({
              next: "/pricing",
            }).toString(),
          }}
          prefetch={false}
        >
          Get Started
        </Link>
      </Button>
    </div>
  );
}
