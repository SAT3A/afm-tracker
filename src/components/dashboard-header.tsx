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
} from "lucide-react";
import { useState, useTransition } from "react";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email: string;
  } | null;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Platforms", href: "/platforms", icon: Globe2 },
  { label: "Personas", href: "/personas", icon: Users2 },
  { label: "Distributions", href: "/distributions", icon: Share2 },
  { label: "Content AI", href: "/content", icon: Video },
  { label: "Best Time", href: "/best-time", icon: Clock },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Campaigns", href: "/campaigns", icon: Tag },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const displayName = user?.name || "Admin Satria";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-card/85 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                AFM Tracker
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
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

            {/* Mobile menu toggle button */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden w-9 h-9 border-border"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {user && (
            <div className="pt-3 border-t border-border space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/60 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <User className="w-4 h-4 text-muted-foreground" />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isPending}
                className="w-full text-xs text-destructive border-destructive/20 hover:bg-destructive/10 gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                Keluar
              </Button>
            </div>
          )}
        </div>
      )}

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
                  AFM Tracker v1.0
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
    </header>
  );
}
