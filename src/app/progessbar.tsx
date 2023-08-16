"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [isProgressing, setIsProgressing] = useState(false);
  const pathname = usePathname();

  const onAnchorClick = () => {
    setIsProgressing(true);
  };

  useEffect(() => {
    const anchors = document.querySelectorAll("a");
    let anchorsWithEvent: HTMLAnchorElement[] = [];
    for (const anchor of anchors) {
      console.log(anchor.href);
      if (
        anchor.href.startsWith(window.origin) &&
        anchor.href !== `${window.origin}${pathname}`
      ) {
        anchor.addEventListener("click", onAnchorClick);
        anchorsWithEvent.push(anchor);
      }
    }

    return () => {
      for (const anchor of anchorsWithEvent) {
        anchor.removeEventListener("click", onAnchorClick);
      }
    };
  }, [pathname]);

  useEffect(() => {
    setIsProgressing(false);
  }, [pathname]);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-1.5 w-screen bg-primary transition-opacity ease-linear"
      style={{
        opacity: isProgressing ? 1 : 0,
        pointerEvents: isProgressing ? "auto" : "none",
      }}
    >
      <div className="progress-bar absolute h-full w-full bg-gradient-to-r from-primary-foreground/20 to-primary-foreground/80"></div>
    </div>
  );
}
