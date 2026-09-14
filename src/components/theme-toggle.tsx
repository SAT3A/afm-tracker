"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "border-slate-200 dark:border-slate-800 opacity-60"
        )}
      >
        <Sun className="h-4 w-4 text-slate-500" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "relative border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        )}
        title="Ubah Mode Tema"
        aria-label="Ubah Mode Tema"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium ${
            theme === "light" ? "text-blue-600 dark:text-blue-400 font-semibold" : ""
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          Light (Terang)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium ${
            theme === "dark" ? "text-blue-600 dark:text-blue-400 font-semibold" : ""
          }`}
        >
          <Moon className="w-4 h-4 text-blue-400" />
          Dark (Gelap)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium ${
            theme === "system" ? "text-blue-600 dark:text-blue-400 font-semibold" : ""
          }`}
        >
          <Monitor className="w-4 h-4 text-slate-500" />
          System (Otomatis)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
