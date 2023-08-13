import { type ReactNode } from "react";
import DashboardLayout from "./dashboard-layout";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { type MenuItem } from "@/types/menu-item";
import { cn } from "@/utils";
import Link from "next/link";

const SettingsLayout = ({ children }: { children: ReactNode }) => {
  const {
    query: { pslug },
    asPath,
  } = useRouter();
  const items: MenuItem[] = [
    {
      label: "General",
      href: pslug ? `/dashboard/${pslug}/settings` : "/dashboard/settings",
      end: true,
    },
    ...(pslug
      ? [
          {
            label: "Billing",
            href: `/dashboard/${pslug}/settings/billing`,
          },
          {
            label: "People",
            href: `/dashboard/${pslug}/settings/people`,
          },
        ]
      : []),
  ];
  return (
    <DashboardLayout>
      <PageHeader title="Settings" />
      <main className="container flex items-start gap-8 py-8">
        <div className="sticky top-36 grid w-64 flex-shrink-0 gap-1">
          {items.map((item, i) => (
            <Button
              key={i}
              asChild
              variant="ghost"
              className={cn("justify-start text-left text-muted-foreground", {
                "bg-muted text-accent-foreground": item.end
                  ? asPath === item.href
                  : asPath.startsWith(item.href),
              })}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </DashboardLayout>
  );
};

export default SettingsLayout;
