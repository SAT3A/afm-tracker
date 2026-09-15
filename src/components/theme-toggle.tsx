"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "w-9 h-9 rounded-xl border-slate-200 dark:border-slate-800 opacity-70 cursor-default"
        )}
        aria-label="Mode Tema"
      >
        <Sun className="h-4 w-4 text-amber-500" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "w-9 h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-xs"
      )}
      title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-blue-400 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
