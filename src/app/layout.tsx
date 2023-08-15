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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
