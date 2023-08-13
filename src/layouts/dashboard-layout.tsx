import ProjectSwitcher from "@/components/project-switcher";
import ThemeSwitcher from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/user-button";
import ProjectProvider from "@/providers/project-provider";
import { type MenuItem } from "@/types/menu-item";
import { cn } from "@/utils";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const {
    isReady,
    query: { pslug },
  } = useRouter();
  const { status } = useSession();

  if (!isReady || status !== "authenticated") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

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
            typeof pslug === "string"
              ? [
                  {
                    href: `/dashboard/${pslug}`,
                    label: "Overview",
                    end: true,
                  },
                  {
                    href: `/dashboard/${pslug}/links`,
                    label: "Links",
                  },
                  {
                    href: `/dashboard/${pslug}/chat`,
                    label: "Chat",
                  },
                  {
                    href: `/dashboard/${pslug}/settings`,
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
      {typeof pslug === "string" ? (
        <ProjectProvider projectSlug={pslug}>{children}</ProjectProvider>
      ) : (
        <>{children}</>
      )}
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
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn("text-muted-foreground", {
                "text-accent-foreground": active,
              })}
            >
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

// const ProtectProject = ({
//   projectSlug,
//   children,
// }: {
//   projectSlug: string;
//   children: ReactNode;
// }) => {
//   const project = api.project.getBySlug.useQuery({ projectSlug });
//   if (project.isLoading) {
//     return (
//       <div className="flex flex-1 items-center justify-center">
//         <Loader2 className="h-6 w-6 animate-spin" />
//       </div>
//     );
//   }
//   if (project.isError) {
//     return <p>Error</p>;
//   }
//   if (!project.data) {
//     return (
//       <Card className="mx-auto my-8 max-w-screen-md">
//         <CardHeader>
//           <CardTitle>Something went wrong!</CardTitle>
//           <CardDescription>
//             Either you don&apos;t have permissions to view this project or this
//             project doesn&apos;t exist. Refresh to try again.
//           </CardDescription>
//         </CardHeader>
//         <CardFooter>
//           <Button onClick={() => project.refetch()}>
//             {project.isRefetching && <ButtonLoadingSpinner />}
//             Refresh
//           </Button>
//         </CardFooter>
//       </Card>
//     );
//   }
//   return <>{children}</>;
// };
