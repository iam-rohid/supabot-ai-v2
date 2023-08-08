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
    query: { project_slug },
    asPath,
  } = useRouter();
  const items: MenuItem[] = [
    {
      label: "General",
      href: project_slug
        ? `/dashboard/${project_slug}/settings`
        : "/dashboard/settings",
      end: true,
    },
    ...(project_slug
      ? [
          {
            label: "Billing",
            href: `/dashboard/${project_slug}/settings/billing`,
          },
          {
            label: "People",
            href: `/dashboard/${project_slug}/settings/people`,
          },
        ]
      : []),
  ];
  return (
    <DashboardLayout>
      <PageHeader title="Settings" />
      <main className="container flex items-start gap-8 py-8">
        <div className="grid w-64 flex-shrink-0 gap-1">
          {items.map((item, i) => (
            <Button
              key={i}
              asChild
              variant="ghost"
              className={cn("justify-start text-left text-muted-foreground", {
                "bg-secondary text-accent-foreground": item.end
                  ? asPath === item.href
                  : asPath.startsWith(item.href),
              })}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
        {children}
      </main>
    </DashboardLayout>
  );
};

export default SettingsLayout;
