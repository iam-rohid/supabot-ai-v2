import { type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {children}
    </div>
  );
}
