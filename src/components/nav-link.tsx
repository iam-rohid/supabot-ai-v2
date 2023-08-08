import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useState } from "react";

export type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement> & {
    activeClassName?: string;
    inactiveClassName?: string;
    end?: boolean;
    href?: string;
  };

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    { activeClassName, inactiveClassName, className, href, end, ...props },
    ref
  ) => {
    const [isActive, setIsActive] = useState(false);
    const { asPath } = useRouter();

    useEffect(() => {
      setIsActive(
        end ? asPath === href.toString() : asPath.startsWith(href.toString())
      );
    }, [end, href, asPath]);

    return (
      <Link
        className={`${className} ${
          isActive ? activeClassName : inactiveClassName
        }`}
        href={href}
        ref={ref}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export default NavLink;
