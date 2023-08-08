import { type ReactNode } from "react";

export type MenuItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
};
