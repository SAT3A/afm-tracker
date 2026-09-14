import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Globe2,
  Users2,
  Share2,
  Video,
  Clock,
  Calendar,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const navigationModules = [
    {
      title: "Products",
      description: "Master data produk affiliate Shopee & komisi",
      icon: Package,
      href: "/products",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
      badge: "Modul 1",
    },
    {
      title: "Platforms",
      description: "Grup Facebook, akun Instagram & Threads",
      icon: Globe2,
      href: "/platforms",
      color: "text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
      badge: "Modul 2",
    },
    {
      title: "Personas",
      description: "Profil AI Creator (Bagas & Naya)",
      icon: Users2,
      href: "/personas",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
      badge: "Modul 3",
    },
    {
      title: "Distributions",
      description: "Sebar link broadcast ke grup & tracking status",
      icon: Share2,
      href: "/distributions",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
      badge: "Modul 4",
    },
    {
      title: "Content AI",
      description: "Video Shopee, Reels FB/IG & metrics views",
      icon: Video,
      href: "/content",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
      badge: "Modul 5",
    },
    {
      title: "Best Posting Time",
      description: "Analisa waktu posting riset per niche & platform",
      icon: Clock,
      href: "/best-time",
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
      badge: "Modul 6",
    },
    {
      title: "Posting Schedule",
      description: "Kalender jadwal posting & browser reminder",
      icon: Calendar,
      href: "/schedule",
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
      badge: "Fitur Pendukung",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">AFM Tracker</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Phase 1 MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <form action={logout}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-blue-600/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Sistem Otentikasi Aktif
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Halo, {user?.name || "Partner"}! 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base">
              Aplikasi AFM Tracker siap membantu Anda mengelola link affiliate Shopee, broadcast grup Facebook, dan melacak performa video AI Bagas & Naya.
            </p>
          </div>
          {/* Background decorative circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Modul Navigasi</h2>
              <p className="text-sm text-slate-500">
                Pilih modul kerja yang ingin Anda kelola
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {navigationModules.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="group hover:shadow-lg transition-all duration-200 border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 relative overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.badge}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-semibold mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link
                      href={item.href}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-2"
                    >
                      Buka Modul ➔
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        AFM Tracker &copy; {new Date().getFullYear()} &bull; Built with Next.js 16, Prisma & Supabase
      </footer>
    </div>
  );
}
