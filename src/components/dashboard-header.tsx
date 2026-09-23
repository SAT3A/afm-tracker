"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  LayoutDashboard,
  Package,
  Globe2,
  Users2,
  Share2,
  Video,
  Clock,
  Calendar,
  Tag,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  Mail,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email: string;
  } | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string | null;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "Summary",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    group: "Master Data",
    items: [
      { label: "Products", href: "/products", icon: Package },
      { label: "Platforms", href: "/platforms", icon: Globe2 },
      { label: "Personas", href: "/personas", icon: Users2 },
    ],
  },
  {
    group: "Operasional & Konten",
    items: [
      { label: "Distributions", href: "/distributions", icon: Share2 },
      { label: "Content AI", href: "/content", icon: Video, badge: "AI" },
      { label: "Schedule", href: "/schedule", icon: Calendar },
    ],
  },
  {
    group: "Strategi & Performa",
    items: [
      { label: "Best Time", href: "/best-time", icon: Clock, badge: "24/7" },
      { label: "Campaigns", href: "/campaigns", icon: Tag },
    ],
  },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Close sidebar automatically on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle Escape key to close sidebar and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const displayName = user?.name || "Admin Satria";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand Trigger (Clicking logo / brand opens the left sidebar) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-3 p-1.5 -ml-1.5 rounded-xl hover:bg-muted/70 active:scale-95 transition-all text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                title="Buka Navigasi Modul (Sidebar)"
                aria-label="Buka Menu Navigasi AFM Tracker"
                aria-expanded={sidebarOpen}
              >
                <div className="relative w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 group-hover:shadow-primary/40 transition-all">
                  <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                    AFM Tracker
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border group-hover:border-primary/40 group-hover:text-foreground transition-all">
                    <Menu className="w-3.5 h-3.5" />
                    <span>Menu</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5">
              {/* 1-Click Dark/Light Mode Switcher */}
              <ThemeToggle />

              {/* User Profile Icon Dropdown Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-9 h-9 rounded-xl bg-muted border border-border hover:border-primary/50 flex items-center justify-center text-foreground transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/20"
                    title="Menu Akun Pengguna"
                    aria-label="Menu Akun Pengguna"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 p-1">
                    {/* User info in dropdown header */}
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Submenu Item 1: Profile */}
                    <DropdownMenuItem
                      onClick={() => setProfileModalOpen(true)}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-md text-foreground hover:bg-muted"
                    >
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>User Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Submenu Item 2: Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isPending}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-md text-destructive hover:bg-destructive/10"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer Overlay & Container */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          sidebarOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!sidebarOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Sidebar Left Panel */}
        <aside
          className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight text-foreground">
                  AFM Tracker
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Content-to-Sales Hub
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Tutup Menu (Esc)"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Grouped Navigation Links (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group/item flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover/item:scale-110 ${
                              isActive
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover/item:text-foreground"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                isActive
                                  ? "bg-white/20 text-primary-foreground"
                                  : "bg-primary/10 text-primary border border-primary/20"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform group-hover/item:translate-x-0.5 ${
                              isActive
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground/40 group-hover/item:text-foreground"
                            }`}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer with User Profile card & Logout */}
          {user && (
            <div className="p-4 border-t border-border bg-muted/30 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-xs transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
              </button>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">
                  AFM Tracker v1.0 • Phase 3
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LogOut className="w-3 h-3" />
                  )}
                  Keluar
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* User Profile Modal Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <User className="w-4 h-4 text-primary" />
              User Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl flex items-center justify-center shadow-md shadow-primary/20">
                {userInitial}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">
                    {displayName}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Role Akses</span>
                <span className="font-semibold text-foreground">
                  Administrator Penuh
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Status Akun</span>
                <span className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Sistem</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  AFM Tracker v1.0 • Phase 3
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProfileModalOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
