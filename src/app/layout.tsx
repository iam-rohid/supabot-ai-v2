import "@/styles/globals.css";
import Providers from "./providers";
import { APP_NAME } from "@/utils/constants";

export const metadata = {
  title: APP_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          async
          src="https://supabotai.com/chatbot-widget.js"
          data-id="5f3ae903-a13f-43ea-88ee-5387b7416ff2"
          data-name="SB-ChatBox"
        ></script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
