import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { type AppPropsWithLayout } from "@/types/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout<{ session: Session | null }>) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <TooltipProvider>
        <Head>
          <title>SupaBot AI</title>
        </Head>
        {getLayout(<Component {...pageProps} />)}
        <Toaster />
      </TooltipProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
