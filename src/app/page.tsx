import { getCurrentUser } from "@/lib/dal";
import { DashboardHeader } from "@/components/dashboard-header";
import { prisma } from "@/lib/prisma";
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
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Fetch real-time metrics in parallel
  const [
    productCount,
    activeProductCount,
    platformCount,
    personaCount,
    distributionCount,
    pendingApprovalCount,
    recentDistributions,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.platform.count(),
    prisma.persona.count(),
    prisma.distribution.count(),
    prisma.distribution.count({ where: { status: "pending_approval" } }),
    prisma.distribution.findMany({
      take: 5,
      orderBy: { postedAt: "desc" },
      include: {
        platform: { select: { name: true, platformType: true } },
        persona: { select: { name: true } },
        items: {
          include: {
            product: { select: { productName: true } },
          },
        },
      },
    }),
  ]);

  const navigationModules = [
    {
      title: "Products",
      description: "Master data produk affiliate Shopee & komisi",
      icon: Package,
      href: "/products",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
      badge: "Modul 1",
      stat: `${productCount} produk (${activeProductCount} aktif)`,
    },
    {
      title: "Platforms",
      description: "Grup Facebook, akun Instagram & Threads",
      icon: Globe2,
      href: "/platforms",
      color: "text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
      badge: "Modul 2",
      stat: `${platformCount} grup/channel`,
    },
    {
      title: "Personas",
      description: "Profil AI Creator (Bagas & Naya)",
      icon: Users2,
      href: "/personas",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
      badge: "Modul 3",
      stat: `${personaCount} persona AI`,
    },
    {
      title: "Distributions",
      description: "Sebar link broadcast ke grup & tracking status",
      icon: Share2,
      href: "/distributions",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
      badge: "Modul 4",
      stat: `${distributionCount} sebaran (${pendingApprovalCount} pending)`,
    },
    {
      title: "Content AI",
      description: "Video Shopee, Reels FB/IG & metrics views",
      icon: Video,
      href: "/content",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
      badge: "Modul 5",
      stat: "Shopee Video & Reels",
    },
    {
      title: "Best Posting Time",
      description: "Analisa waktu posting riset per niche & platform",
      icon: Clock,
      href: "/best-time",
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
      badge: "Modul 6",
      stat: "Riset jadwal prime-time",
    },
    {
      title: "Posting Schedule",
      description: "Kalender jadwal posting & browser reminder",
      icon: Calendar,
      href: "/schedule",
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
      badge: "Fitur Pendukung",
      stat: "Pengingat & kalender",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <DashboardHeader user={user} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-blue-600/10">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4 text-white">
              <Sparkles className="w-3.5 h-3.5" />
              AFM Tracker &bull; Affiliate Operations
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Halo, {user?.name || "Partner"}! 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
              Kelola katalog produk Shopee Affiliate, sebar link ke grup-grup Facebook secara satuan maupun batch multi-grup, dan pantau persona AI Anda dengan cepat.
            </p>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link
                href="/distributions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all shadow-md shadow-black/10 hover:scale-[1.02]"
              >
                <Share2 className="w-3.5 h-3.5" />
                Sebar Link Baru
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all"
              >
                <Package className="w-3.5 h-3.5" />
                Kelola Produk
              </Link>
              <Link
                href="/platforms"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all"
              >
                <Globe2 className="w-3.5 h-3.5" />
                Target Grup
              </Link>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Live KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Produk
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
                {productCount}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {activeProductCount} produk aktif
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Platform & Grup
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center">
                <Globe2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
                {platformCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target grup sebar link
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Persona AI
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <Users2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
                {personaCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kreator konten & sebar
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Sebaran Link
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
                {distributionCount}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {pendingApprovalCount} menunggu approval
              </p>
            </div>
          </div>
        </div>

        {/* Recent Distributions Widget */}
        {recentDistributions.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Aktivitas Sebar Link Terkini
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau sebaran link terbaru yang telah diposting
                </p>
              </div>
              <Link
                href="/distributions"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {recentDistributions.map((dist) => (
                <div
                  key={dist.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {dist.platform.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1 py-0 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                        {dist.platform.platformType}
                      </span>
                      {dist.status === "pending_approval" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                          <ShieldAlert className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Oleh <strong className="text-slate-600 dark:text-slate-300">{dist.persona.name}</strong> &bull; {dist.items.length} produk: {dist.items.map((i) => i.product.productName).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {new Date(dist.postedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {dist.postUrl && (
                      <a
                        href={dist.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Buka Post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium"
                      >
                        {item.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2 py-3">
                    <span className="text-xs text-slate-500 font-medium">
                      {item.stat}
                    </span>
                    <Link
                      href={item.href}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline gap-1"
                    >
                      Buka <ArrowRight className="w-3 h-3" />
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
