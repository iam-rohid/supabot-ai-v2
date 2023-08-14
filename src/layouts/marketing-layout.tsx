import MarketingHeader from "@/components/marketing-header";
import Script from "next/script";
import { type ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        async
        src="http://localhost:3000/chatbot-widget.js"
        data-id="5f3ae903-a13f-43ea-88ee-5387b7416ff2"
        data-name="SB-ChatBox"
        data-color="#5F7FFF"
        data-position="right"
        data-x-margin="20"
        data-y-margin="20"
      ></Script>

      <MarketingHeader />
      {children}
    </>
  );
}
