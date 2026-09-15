"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // When pathname changes, finish the progress bar smoothly
    if (barRef.current) {
      barRef.current.style.width = "100%";
      const finishTimer = setTimeout(() => {
        if (barRef.current) {
          barRef.current.style.opacity = "0";
          setTimeout(() => {
            if (barRef.current) barRef.current.style.width = "0%";
          }, 200);
        }
      }, 200);

      return () => clearTimeout(finishTimer);
    }
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.hasAttribute("download") &&
        target.target !== "_blank"
      ) {
        if (href !== window.location.pathname) {
          if (barRef.current) {
            barRef.current.style.opacity = "1";
            barRef.current.style.width = "30%";

            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              if (barRef.current) barRef.current.style.width = "75%";
            }, 180);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-1 bg-transparent">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] shadow-sm shadow-blue-500/50 transition-all duration-300 ease-out opacity-0"
        style={{ width: "0%" }}
      />
    </div>
  );
}
