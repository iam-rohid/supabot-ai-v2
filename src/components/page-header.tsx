import { type ReactNode } from "react";

export default function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b bg-card text-card-foreground">
      <div className="container flex min-h-[8rem] items-center py-4">
        <h2 className="flex-1 truncate text-2xl font-semibold">{title}</h2>
        {children}
      </div>
    </header>
  );
}
