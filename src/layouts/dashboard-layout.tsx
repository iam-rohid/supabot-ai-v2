import ProjectSwitcher from "@/components/project-switcher";
import ThemeSwitcher from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/user-button";
import { type MenuItem } from "@/types/menu-item";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const {
    query: { project_slug },
  } = useRouter();
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-card text-card-foreground">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/dashboard">
              <div className="h-10 w-10 rounded-full bg-accent-foreground" />
            </Link>
          </Button>
          <div className="mx-4 h-6 w-px rotate-12 bg-border" />
          <ProjectSwitcher />
          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeSwitcher />
            <UserButton />
          </div>
        </div>
        <NavBar
          menuList={
            typeof project_slug === "string"
              ? [
                  {
                    href: `/dashboard/${project_slug}`,
                    label: "Overview",
                    end: true,
                  },
                  {
                    href: `/dashboard/${project_slug}/links`,
                    label: "Links",
                  },
                  {
                    href: `/dashboard/${project_slug}/settings`,
                    label: "Settings",
                  },
                ]
              : [
                  {
                    href: "/dashboard",
                    label: "Overview",
                    end: true,
                  },
                  {
                    href: "/dashboard/settings",
                    label: "Settings",
                  },
                ]
          }
        />
      </header>
      {children}
    </>
  );
};

export default DashboardLayout;

function NavBar({ menuList }: { menuList: MenuItem[] }) {
  const { asPath } = useRouter();
  if (menuList.length === 0) {
    return null;
  }
  return (
    <div className="container flex items-center">
      {menuList.map((item, i) => {
        const active = item.end
          ? asPath === item.href
          : asPath.startsWith(item.href);
        return (
          <div key={i} className="relative inline pb-2 first:-ml-3">
            <Button asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
            {active && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-primary" />
            )}
          </div>
        );
      })}
    </div>
  );
}
