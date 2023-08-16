import Providers from "@/app/providers";
import { type ReactNode } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/utils";
import { getProjectById } from "@/server/models/project";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import Color from "color";
import { BASE_URL, APP_NAME } from "@/utils/constants";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

function getTailwindVarFromColor(color: Color) {
  return color
    .hsl()
    .string()
    .replace("hsl(", "")
    .replaceAll(",", "")
    .replace(")", "");
}

export default async function Layout({
  children,
  params: { projectId },
}: {
  children: ReactNode;
  params: { projectId: string };
}) {
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const primary = new Color(project.theme.primary_color || "#6366F1");
  const primaryForeground = new Color(primary.isLight() ? "#000" : "#fff");

  return (
    <html lang="en">
      <head>
        <style>
          {`
          :root,
          .dark {
            --primary: ${getTailwindVarFromColor(primary)};
            --primary-foreground: ${getTailwindVarFromColor(primaryForeground)};
            --ring: ${getTailwindVarFromColor(primary)};
          }
          `}
        </style>
      </head>
      <body className={cn(inter.className, "flex h-screen w-screen flex-col")}>
        <Providers>
          {children}
          <div className="flex items-center justify-center border-t bg-card p-2">
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <Link
                href={BASE_URL}
                target="_blank"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {APP_NAME}
              </Link>
            </p>
          </div>
        </Providers>
      </body>
    </html>
  );
}
