import "@/styles/globals.css";
import { type ReactNode } from "react";
import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { APP_NAME } from "@/utils/constants";
import { cn } from "@/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import Providers from "./providers";
import ProgressBar from "./progessbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
};

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={cn(inter.className, "flex min-h-screen flex-col")}>
        <ProgressBar />
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
