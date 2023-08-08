import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { type AppPropsWithLayout } from "@/types/next";
import { ThemeProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout<{ session: Session | null }>) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
        <TooltipProvider>
          {getLayout(<Component {...pageProps} />)}
          <Toaster />
        </TooltipProvider>
        <ReactQueryDevtools />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
