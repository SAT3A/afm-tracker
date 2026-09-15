"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 text-primary shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-primary shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans text-xs p-3.5",
          title: "font-bold text-xs text-foreground",
          description: "group-[.toast]:text-muted-foreground text-[11px] mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
