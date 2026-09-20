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
  ShoppingBag,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlatformDistributionChart } from "@/components/charts/platform-distribution-chart";
import { TopPerformers } from "@/components/charts/top-performers";
import { PersonaComparison } from "@/components/charts/persona-comparison";
import { ActivityPublishingTrend } from "@/components/charts/activity-publishing-trend";
import { NichePerformanceChart } from "@/components/charts/niche-performance-chart";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Consolidated batch queries for high performance
  type CountRow = {
    product_count: number;
    active_product_count: number;
    platform_count: number;
    persona_count: number;
    distribution_count: number;
    pending_approval_count: number;
    content_count: number;
  };

  const [
    [counts],
    recentDistributions,
    recentContents,
    allDistributions,
    allContents,
    allPersonas,
    rawProducts,
    rawPlatforms,
  ] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT 
        (SELECT COUNT(*) FROM products)::int as product_count,
        (SELECT COUNT(*) FROM products WHERE status = 'active')::int as active_product_count,
        (SELECT COUNT(*) FROM platforms)::int as platform_count,
        (SELECT COUNT(*) FROM personas)::int as persona_count,
        (SELECT COUNT(*) FROM distributions)::int as distribution_count,
        (SELECT COUNT(*) FROM distributions WHERE status = 'pending_approval')::int as pending_approval_count,
        (SELECT COUNT(*) FROM contents)::int as content_count
    `,
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
    prisma.content.findMany({
      take: 5,
      orderBy: { publishedAt: "desc" },
      include: {
        persona: { select: { name: true } },
        metrics: {
          orderBy: { capturedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.distribution.findMany({
      include: {
        platform: { select: { id: true, name: true, platformType: true } },
        persona: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                brand: true,
                price: true,
                commissionRate: true,
                category: true,
              },
            },
          },
        },
        engagements: {
          orderBy: { capturedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.content.findMany({
      include: {
        persona: { select: { id: true, name: true } },
        metrics: {
          orderBy: { capturedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.persona.findMany({
      where: { status: "active" },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      include: {
        _count: { select: { distributionItems: true } },
      },
    }),
    prisma.platform.findMany({
      where: { status: "active" },
      include: {
        _count: { select: { distributions: true } },
      },
    }),
  ]);

  const productCount = counts?.product_count ?? 0;
  const activeProductCount = counts?.active_product_count ?? 0;
  const platformCount = counts?.platform_count ?? 0;
  const personaCount = counts?.persona_count ?? 0;
  const distributionCount = counts?.distribution_count ?? 0;
  const pendingApprovalCount = counts?.pending_approval_count ?? 0;
  const contentCount = counts?.content_count ?? 0;

  // Calculate Total Estimated Earnings
  let totalEstimatedEarnings = 0;
  for (const dist of allDistributions) {
    const latestEng = dist.engagements[0];
    if (latestEng && latestEng.ordersCount && latestEng.ordersCount > 0) {
      const avgComm =
        dist.items.length > 0
          ? dist.items.reduce(
              (sum, item) =>
                sum +
                (Number(item.product.price) *
                  Number(item.product.commissionRate)) /
                  100,
              0
            ) / dist.items.length
          : 0;
      totalEstimatedEarnings += latestEng.ordersCount * avgComm;
    }
  }

  // 1. Platform Distribution Breakdown (for Chart)
  const platformCounts: Record<string, number> = {
    facebook: 0,
    instagram: 0,
    threads: 0,
    tiktok: 0,
    other: 0,
  };

  for (const dist of allDistributions) {
    const type = dist.platform.platformType.toLowerCase();
    if (type in platformCounts) {
      platformCounts[type] += 1;
    } else {
      platformCounts.other += 1;
    }
  }

  const platformChartData = [
    { name: "Facebook", count: platformCounts.facebook, color: "#1877F2" },
    { name: "Instagram", count: platformCounts.instagram, color: "#E4405F" },
    { name: "Threads", count: platformCounts.threads, color: "#000000" },
    { name: "TikTok", count: platformCounts.tiktok, color: "#8B5CF6" },
    { name: "Lainnya", count: platformCounts.other, color: "#10B981" },
  ].filter((p) => p.count > 0);

  // 2. Top 5 Products Calculation
  const productPerformanceMap = new Map<
    string,
    {
      id: string;
      productName: string;
      brand: string;
      price: number;
      commissionRate: number;
      distributionCount: number;
      totalOrders: number;
      totalClicks: number;
    }
  >();

  for (const p of rawProducts) {
    productPerformanceMap.set(p.id, {
      id: p.id,
      productName: p.productName,
      brand: p.brand,
      price: Number(p.price),
      commissionRate: Number(p.commissionRate),
      distributionCount: p._count.distributionItems,
      totalOrders: 0,
      totalClicks: 0,
    });
  }

  for (const dist of allDistributions) {
    const latest = dist.engagements[0];
    if (latest) {
      for (const item of dist.items) {
        const prod = productPerformanceMap.get(item.product.id);
        if (prod) {
          prod.totalOrders += latest.ordersCount || 0;
          prod.totalClicks += latest.clicksCount || 0;
        }
      }
    }
  }

  const topProducts = Array.from(productPerformanceMap.values())
    .sort((a, b) => b.distributionCount - a.distributionCount || b.totalOrders - a.totalOrders)
    .slice(0, 5);

  // 3. Top 5 Platforms Calculation
  const platformPerformanceMap = new Map<
    string,
    {
      id: string;
      name: string;
      platformType: string;
      distributionCount: number;
      totalViews: number;
      totalClicks: number;
    }
  >();

  for (const pl of rawPlatforms) {
    platformPerformanceMap.set(pl.id, {
      id: pl.id,
      name: pl.name,
      platformType: pl.platformType,
      distributionCount: pl._count.distributions,
      totalViews: 0,
      totalClicks: 0,
    });
  }

  for (const dist of allDistributions) {
    const latest = dist.engagements[0];
    const plat = platformPerformanceMap.get(dist.platform.id);
    if (plat && latest) {
      plat.totalViews += latest.viewsCount || 0;
      plat.totalClicks += latest.clicksCount || 0;
    }
  }

  const topPlatforms = Array.from(platformPerformanceMap.values())
    .sort((a, b) => b.distributionCount - a.distributionCount || b.totalClicks - a.totalClicks)
    .slice(0, 5);

  // 4. Persona Performance Comparison
  const personaComparisonData = allPersonas.map((persona) => {
    const personaDists = allDistributions.filter(
      (d) => d.persona.id === persona.id
    );
    const personaContents = allContents.filter(
      (c) => c.persona.id === persona.id
    );

    let views = 0;
    let clicks = 0;
    let orders = 0;
    let earnings = 0;

    for (const d of personaDists) {
      const eng = d.engagements[0];
      if (eng) {
        views += eng.viewsCount || 0;
        clicks += eng.clicksCount || 0;
        orders += eng.ordersCount || 0;
        if (eng.ordersCount && eng.ordersCount > 0) {
          const avgComm =
            d.items.length > 0
              ? d.items.reduce(
                  (sum, item) =>
                    sum +
                    (Number(item.product.price) *
                      Number(item.product.commissionRate)) /
                      100,
                  0
                ) / d.items.length
              : 0;
          earnings += eng.ordersCount * avgComm;
        }
      }
    }

    for (const c of personaContents) {
      const metric = c.metrics[0];
      if (metric) {
        views += metric.viewsCount || 0;
        clicks += metric.clicksCount || 0;
      }
    }

    let niches: string[] = [];
    try {
      if (Array.isArray(persona.niches)) {
        niches = persona.niches as string[];
      }
    } catch {
      niches = [];
    }

    return {
      id: persona.id,
      name: persona.name,
      avatarUrl: persona.avatarUrl,
      niches,
      distributionCount: personaDists.length,
      contentCount: personaContents.length,
      totalViews: views,
      totalClicks: clicks,
      totalOrders: orders,
      estimatedEarnings: earnings,
    };
  });

  // 5. Activity Publishing Trend (Past 14 Days)
  const activityTrendData = [];
  const now = new Date();
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

  for (let i = 13; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const yyyy = targetDate.getFullYear();
    const mm = targetDate.getMonth();
    const dd = targetDate.getDate();

    const distsOnDay = allDistributions.filter((d) => {
      const dt = new Date(d.postedAt);
      return dt.getFullYear() === yyyy && dt.getMonth() === mm && dt.getDate() === dd;
    }).length;

    const contentsOnDay = allContents.filter((c) => {
      const dt = new Date(c.publishedAt);
      return dt.getFullYear() === yyyy && dt.getMonth() === mm && dt.getDate() === dd;
    }).length;

    activityTrendData.push({
      date: `${dd} ${monthShort[mm]}`,
      fullDate: `${dayNames[targetDate.getDay()]}, ${dd} ${monthShort[mm]} ${yyyy}`,
      distributions: distsOnDay,
      contents: contentsOnDay,
    });
  }

  // 6. Niche / Category Performance
  const categoryMap = new Map<
    string,
    {
      category: string;
      productCount: number;
      distributionCount: number;
      totalClicks: number;
      totalOrders: number;
      estimatedEarnings: number;
    }
  >();

  for (const prod of rawProducts) {
    const cat = prod.category || "Lainnya";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        productCount: 0,
        distributionCount: 0,
        totalClicks: 0,
        totalOrders: 0,
        estimatedEarnings: 0,
      });
    }
    const cObj = categoryMap.get(cat)!;
    cObj.productCount += 1;
    cObj.distributionCount += prod._count.distributionItems;
  }

  for (const dist of allDistributions) {
    const latest = dist.engagements[0];
    if (latest) {
      for (const item of dist.items) {
        const cat = item.product.category || "Lainnya";
        if (categoryMap.has(cat)) {
          const cObj = categoryMap.get(cat)!;
          cObj.totalClicks += latest.clicksCount || 0;
          cObj.totalOrders += latest.ordersCount || 0;
          if (latest.ordersCount && latest.ordersCount > 0) {
            const comm =
              (Number(item.product.price) * Number(item.product.commissionRate)) / 100;
            cObj.estimatedEarnings += latest.ordersCount * comm;
          }
        }
      }
    }
  }

  const nichePerformanceData = Array.from(categoryMap.values())
    .sort((a, b) => b.estimatedEarnings - a.estimatedEarnings || b.totalClicks - a.totalClicks)
    .slice(0, 6);

  const navigationModules = [
    {
      title: "Products",
      description: "Master data produk affiliate Shopee & komisi",
      icon: Package,
      href: "/products",
      color: "text-primary bg-primary/10 border-primary/20",
      badge: "Modul 1",
      stat: `${productCount} produk (${activeProductCount} aktif)`,
    },
    {
      title: "Platforms",
      description: "Grup Facebook, akun Instagram & Threads",
      icon: Globe2,
      href: "/platforms",
      color: "text-primary bg-primary/10 border-primary/20",
      badge: "Modul 2",
      stat: `${platformCount} grup/channel`,
    },
    {
      title: "Personas",
      description: "Profile AI Creator & Niche",
      icon: Users2,
      href: "/personas",
      color: "text-secondary bg-secondary/10 border-secondary/20",
      badge: "Modul 3",
      stat: `${personaCount} persona AI`,
    },
    {
      title: "Distributions",
      description: "Sebar link broadcast ke grup & tracking status",
      icon: Share2,
      href: "/distributions",
      color: "text-secondary bg-secondary/10 border-secondary/20",
      badge: "Modul 4",
      stat: `${distributionCount} sebaran (${pendingApprovalCount} pending)`,
    },
    {
      title: "Content AI",
      description: "Video Shopee, Reels FB/IG & metrics views",
      icon: Video,
      href: "/content",
      color: "text-accent bg-accent/10 border-accent/20",
      badge: "Modul 5",
      stat: `${contentCount} video aktif`,
    },
    {
      title: "Best Posting Time",
      description: "Analisa waktu posting riset per niche & platform",
      icon: Clock,
      href: "/best-time",
      color: "text-primary bg-primary/10 border-primary/20",
      badge: "Modul 6",
      stat: "Riset prime-time",
    },
    {
      title: "Posting Schedule",
      description: "Kalender jadwal posting & browser reminder",
      icon: Calendar,
      href: "/schedule",
      color: "text-secondary bg-secondary/10 border-secondary/20",
      badge: "Modul 6c",
      stat: "Pengingat & kalender",
    },
    {
      title: "Campaigns",
      description: "Pelaporan performa komisi & order per campaign",
      icon: Tag,
      href: "/campaigns",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badge: "Phase 3",
      stat: "Analitik campaign",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <DashboardHeader user={user} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-blue-800 dark:from-blue-900 dark:to-slate-900 p-8 text-white shadow-xl shadow-blue-600/10">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4 text-white">
              <Sparkles className="w-3.5 h-3.5" />
              AFM Tracker &nbsp;-&nbsp; Content to Sales Performance
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Halo, {user?.name || "Partner"}! 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
              Pantau distribusi link Shopee Affiliate, analisa performa konten video AI, dan ukur estimasi komisi penjualan affiliate Anda secara real-time.
            </p>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link
                href="/distributions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card text-primary hover:bg-card/90 text-xs font-bold transition-all shadow-md shadow-black/10 hover:scale-[1.02]"
              >
                <Share2 className="w-3.5 h-3.5" />
                Sebar Link Baru
              </Link>
              <Link
                href="/content"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                Tambah Video AI
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all"
              >
                <Package className="w-3.5 h-3.5" />
                Kelola Produk
              </Link>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Live KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Produk
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground mt-3">
                {productCount}
              </p>
              <p className="text-[11px] text-secondary font-semibold mt-0.5">
                {activeProductCount} produk aktif
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Sebaran Link
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground mt-3">
                {distributionCount}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {pendingApprovalCount} menunggu approval
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Konten Video AI
              </span>
              <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground mt-3">
                {contentCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Shopee Video & Reels
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Estimasi Earning
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
                Rp {Math.round(totalEstimatedEarnings).toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dari pesanan terpantau
              </p>
            </div>
          </div>
        </div>

        {/* Persona Comparison Section */}
        <PersonaComparison data={personaComparisonData} />

        {/* Top 5 Performers (Products & Groups) */}
        <TopPerformers topProducts={topProducts} topPlatforms={topPlatforms} />

        {/* New Insightful Charts: Publishing Trend & Niche Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityPublishingTrend data={activityTrendData} />
          <NichePerformanceChart data={nichePerformanceData} />
        </div>

        {/* Platform Distribution Chart & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlatformDistributionChart data={platformChartData} />

          {/* Recent Activity Card */}
          <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Share2 className="w-4 h-4 text-primary" />
                    Aktivitas Sebar Link Terkini
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Sebaran link dan konten terbaru yang telah diposting
                  </CardDescription>
                </div>
                <Link
                  href="/distributions"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="pt-0 flex-1">
              {recentDistributions.length === 0 && recentContents.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Belum ada aktivitas sebaran terbaru.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentDistributions.map((dist) => (
                    <div
                      key={dist.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground truncate">
                            {dist.platform.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1 py-0 bg-muted text-muted-foreground rounded">
                            {dist.platform.platformType}
                          </span>
                          {dist.status === "pending_approval" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              <ShieldAlert className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px] truncate">
                          Oleh{" "}
                          <strong className="text-foreground">
                            {dist.persona.name}
                          </strong>{" "}
                          &bull; {dist.items.length} produk:{" "}
                          {dist.items.map((i) => i.product.productName).join(", ")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(dist.postedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {dist.postUrl && (
                          <a
                            href={dist.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary p-1"
                            title="Buka Post"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modules Navigation Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Modul Navigasi</h2>
              <p className="text-sm text-muted-foreground">
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
                  className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/50 relative overflow-hidden"
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
                    <CardTitle className="text-lg font-semibold mt-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex items-center justify-between border-t border-border mt-2 py-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.stat}
                    </span>
                    <Link
                      href={item.href}
                      className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
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
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &copy; {new Date().getFullYear()} &bull; Built with Next.js 16, Prisma & Supabase
      </footer>
    </div>
  );
}
