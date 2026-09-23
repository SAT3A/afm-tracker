import { getCurrentUser } from "@/lib/dal";
import { DashboardHeader } from "@/components/dashboard-header";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Share2,
  Video,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { PlatformDistributionChart } from "@/components/charts/platform-distribution-chart";
import { TopPerformers } from "@/components/charts/top-performers";
import { ActivityPublishingTrend } from "@/components/charts/activity-publishing-trend";
import { NichePerformanceChart } from "@/components/charts/niche-performance-chart";

// Phase 1 Analytics Decision Support Components
import { GlobalAnalyticsFilter } from "@/components/dashboard/global-analytics-filter";
import { BusinessOverview } from "@/components/dashboard/business-overview";
import { AffiliateFunnelCard } from "@/components/dashboard/affiliate-funnel-card";
import {
  ContentPerformanceTable,
  ContentPerformanceItem,
} from "@/components/dashboard/content-performance-table";
import {
  ProductAnalyticsTable,
  ProductAnalyticsItem,
} from "@/components/dashboard/product-analytics-table";
import {
  ChannelEfficiencyTable,
  ChannelEfficiencyItem,
} from "@/components/dashboard/channel-efficiency-table";

import {
  calculateEngagementRate,
  calculateCTR,
  calculateConversionRate,
  calculateEPC,
  calculateEfficiency,
} from "@/lib/analytics/metrics";
import { evaluateContentDiagnostics } from "@/lib/analytics/diagnostics";

interface PageProps {
  searchParams?: Promise<{
    range?: string;
    platform?: string;
    channel?: string;
    product?: string;
    persona?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  // Resolve search parameters for global analytics filtering
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedRange = resolvedParams.range || "14d";
  const selectedPlatform =
    resolvedParams.platform && resolvedParams.platform !== "all"
      ? resolvedParams.platform.toLowerCase()
      : null;
  const selectedChannel =
    resolvedParams.channel && resolvedParams.channel !== "all"
      ? resolvedParams.channel
      : null;
  const selectedProduct =
    resolvedParams.product && resolvedParams.product !== "all"
      ? resolvedParams.product
      : null;
  const selectedPersona =
    resolvedParams.persona && resolvedParams.persona !== "all"
      ? resolvedParams.persona
      : null;

  // Cohort date cutoff computation
  const now = new Date();
  let dateCutoff: Date | null = null;
  if (selectedRange === "7d") {
    dateCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (selectedRange === "14d") {
    dateCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  } else if (selectedRange === "30d") {
    dateCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Build Prisma where clauses honoring cohort boundaries and filter selections
  const distributionWhere: Prisma.DistributionWhereInput = {};
  if (dateCutoff) {
    distributionWhere.postedAt = { gte: dateCutoff };
  }
  if (selectedPersona) {
    distributionWhere.personaId = selectedPersona;
  }
  if (selectedChannel) {
    distributionWhere.platformId = selectedChannel;
  }
  if (selectedPlatform) {
    distributionWhere.platform = {
      platformType: { equals: selectedPlatform, mode: "insensitive" },
    };
  }
  if (selectedProduct) {
    distributionWhere.items = { some: { productId: selectedProduct } };
  }

  const contentWhere: Prisma.ContentWhereInput = {};
  if (dateCutoff) {
    contentWhere.publishedAt = { gte: dateCutoff };
  }
  if (selectedPersona) {
    contentWhere.personaId = selectedPersona;
  }
  if (selectedProduct) {
    contentWhere.products = { some: { productId: selectedProduct } };
  }
  if (selectedPlatform) {
    contentWhere.contentType = {
      contains: selectedPlatform,
      mode: "insensitive",
    };
  }
  if (selectedChannel) {
    // Content is not tied to a specific group/channel.
    // If a specific group/channel is filtered, content is excluded from that group's funnel.
    contentWhere.id = "none-matching-channel";
  }

  // Consolidated database queries
  const [
    filteredDistributions,
    filteredContents,
    allPlatforms,
    allProducts,
    allPersonas,
    recentDistributions,
  ] = await Promise.all([
    prisma.distribution.findMany({
      where: distributionWhere,
      orderBy: { postedAt: "desc" },
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
      where: contentWhere,
      orderBy: { publishedAt: "desc" },
      include: {
        persona: { select: { id: true, name: true } },
        products: {
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
        metrics: {
          orderBy: { capturedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.platform.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { distributions: true } },
      },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      orderBy: { productName: "asc" },
      include: {
        _count: { select: { distributionItems: true } },
      },
    }),
    prisma.persona.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    }),
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

  // Master platform types for filter dropdown
  const platformTypeSet = new Set<string>();
  allPlatforms.forEach((p) => {
    if (p.platformType) platformTypeSet.add(p.platformType.toLowerCase());
  });
  platformTypeSet.add("shopee");
  platformTypeSet.add("tiktok");
  const platformTypesList = Array.from(platformTypeSet);

  // ----------------------------------------------------
  // 1. CANONICAL AGGREGATION FOR BUSINESS OVERVIEW & FUNNEL
  // ----------------------------------------------------
  const contentPerformanceItems: ContentPerformanceItem[] = filteredContents.map(
    (c) => {
      const metric = c.metrics[0];
      const views = metric?.viewsCount || 0;
      const likes = metric?.likesCount || 0;
      const comments = metric?.commentsCount || 0;
      const shares = metric?.sharesCount || 0;
      const saves = metric?.savesCount || 0;
      const clicks = metric?.clicksCount || 0;
      const orders = metric?.ordersCount || 0;
      const totalEng = likes + comments + shares + saves;

      let comm = 0;
      let isActual = false;
      if (metric?.actualCommission != null) {
        comm = Number(metric.actualCommission);
        isActual = true;
      } else if (orders > 0 && c.products.length > 0) {
        const avgCommPerOrder =
          c.products.reduce((acc, cp) => {
            return (
              acc +
              (Number(cp.product.price) * Number(cp.product.commissionRate)) /
                100
            );
          }, 0) / c.products.length;
        comm = orders * avgCommPerOrder;
      }

      const er = calculateEngagementRate(totalEng, views).rate;
      const ctr = calculateCTR(clicks, views).ctr;
      const cvr = calculateConversionRate(orders, clicks);
      const epc = calculateEPC(comm, clicks);
      const diagnostics = evaluateContentDiagnostics({
        views,
        clicks,
        orders,
        likes,
        comments,
        shares,
        saves,
      });

      return {
        id: c.id,
        title: c.title,
        contentType: c.contentType,
        platformUrl: c.platformUrl,
        publishedAt: c.publishedAt,
        personaName: c.persona.name,
        productNames: c.products.map((cp) => cp.product.productName),
        views,
        likes,
        comments,
        shares,
        saves,
        clicks,
        orders,
        commission: comm,
        isActualCommission: isActual,
        er,
        ctr,
        cvr,
        epc,
        diagnosisStatus: diagnostics.status,
        diagnosisBadge: diagnostics.badgeLabel,
        possibleBottleneck: diagnostics.possibleBottleneck,
        suggestedTest: diagnostics.suggestedTest,
      };
    }
  );

  const totalVideoViews = contentPerformanceItems.reduce(
    (acc, c) => acc + c.views,
    0
  );
  const totalContentLikes = contentPerformanceItems.reduce(
    (acc, c) => acc + c.likes,
    0
  );
  const totalContentComments = contentPerformanceItems.reduce(
    (acc, c) => acc + c.comments,
    0
  );
  const totalContentShares = contentPerformanceItems.reduce(
    (acc, c) => acc + c.shares,
    0
  );
  const totalContentSaves = contentPerformanceItems.reduce(
    (acc, c) => acc + c.saves,
    0
  );
  const totalContentClicks = contentPerformanceItems.reduce(
    (acc, c) => acc + c.clicks,
    0
  );
  const totalContentOrders = contentPerformanceItems.reduce(
    (acc, c) => acc + c.orders,
    0
  );
  const totalContentCommission = contentPerformanceItems.reduce(
    (acc, c) => acc + c.commission,
    0
  );

  let totalPostImpressions = 0;
  let totalDistLikes = 0;
  let totalDistShares = 0;
  let totalDistClicks = 0;
  let totalDistOrders = 0;
  let totalDistCommission = 0;

  for (const dist of filteredDistributions) {
    const eng = dist.engagements[0];
    const views = eng?.viewsCount || 0;
    const likes = eng?.likesCount || 0;
    const shares = eng?.sharesCount || 0;
    const clicks = eng?.clicksCount || 0;
    const orders = eng?.ordersCount || 0;

    totalPostImpressions += views;
    totalDistLikes += likes;
    totalDistShares += shares;
    totalDistClicks += clicks;
    totalDistOrders += orders;

    if (eng?.actualCommission != null) {
      totalDistCommission += Number(eng.actualCommission);
    } else if (orders > 0 && dist.items.length > 0) {
      const avgComm =
        dist.items.reduce(
          (sum, item) =>
            sum +
            (Number(item.product.price) *
              Number(item.product.commissionRate)) /
              100,
          0
        ) / dist.items.length;
      totalDistCommission += orders * avgComm;
    }
  }

  // Combined Totals (Canonical Attribution)
  const combinedTotalViews = totalVideoViews + totalPostImpressions;
  const combinedAffiliateClicks = totalContentClicks + totalDistClicks;
  const combinedOrders = totalContentOrders + totalDistOrders;
  const combinedCommission = totalContentCommission + totalDistCommission;

  const totalLikes = totalContentLikes + totalDistLikes;
  const totalComments = totalContentComments;
  const totalShares = totalContentShares + totalDistShares;
  const totalSaves = totalContentSaves;
  const combinedEngagements =
    totalLikes + totalComments + totalShares + totalSaves;

  const overallER = calculateEngagementRate(
    combinedEngagements,
    combinedTotalViews
  ).rate;
  const overallCTR = calculateCTR(
    combinedAffiliateClicks,
    combinedTotalViews
  ).ctr;
  const overallCVR = calculateConversionRate(
    combinedOrders,
    combinedAffiliateClicks
  );
  const overallEPC = calculateEPC(
    combinedCommission,
    combinedAffiliateClicks
  );

  const businessOverviewMetrics = {
    totalViews: combinedTotalViews,
    videoViews: totalVideoViews,
    postImpressions: totalPostImpressions,
    totalEngagements: combinedEngagements,
    engagementRate: overallER,
    affiliateClicks: combinedAffiliateClicks,
    affiliateCTR: overallCTR,
    orders: combinedOrders,
    conversionRate: overallCVR,
    commission: combinedCommission,
    epc: overallEPC,
    totalProducts: allProducts.length,
    activeProducts: allProducts.filter((p) => p.status === "active").length,
    totalDistributions: filteredDistributions.length,
    pendingDistributions: filteredDistributions.filter(
      (d) => d.status === "pending_approval"
    ).length,
    totalContents: filteredContents.length,
  };

  const affiliateFunnelData = {
    views: combinedTotalViews,
    videoViews: totalVideoViews,
    postImpressions: totalPostImpressions,
    clicks: combinedAffiliateClicks,
    orders: combinedOrders,
    commission: combinedCommission,
    epc: overallEPC,
    ctr: overallCTR,
    cvr: overallCVR,
    engagements: {
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      saves: totalSaves,
      total: combinedEngagements,
      rate: overallER,
    },
  };

  // ----------------------------------------------------
  // 2. PRODUCT EFFICIENCY AGGREGATION
  // ----------------------------------------------------
  const productAggregationMap = new Map<
    string,
    {
      product: (typeof allProducts)[0];
      distributionCount: number;
      totalClicks: number;
      totalOrders: number;
      totalCommission: number;
    }
  >();

  for (const p of allProducts) {
    productAggregationMap.set(p.id, {
      product: p,
      distributionCount: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalCommission: 0,
    });
  }

  for (const dist of filteredDistributions) {
    const eng = dist.engagements[0];
    const clicks = eng?.clicksCount || 0;
    const orders = eng?.ordersCount || 0;

    for (const item of dist.items) {
      const entry = productAggregationMap.get(item.product.id);
      if (entry) {
        entry.distributionCount += 1;
        entry.totalClicks += clicks;
        entry.totalOrders += orders;
        if (eng?.actualCommission != null) {
          entry.totalCommission +=
            Number(eng.actualCommission) / dist.items.length;
        } else if (orders > 0) {
          const itemComm =
            (Number(item.product.price) *
              Number(item.product.commissionRate)) /
            100;
          entry.totalCommission += orders * itemComm;
        }
      }
    }
  }

  const productAnalyticsItems: ProductAnalyticsItem[] = Array.from(
    productAggregationMap.values()
  )
    .filter((p) => p.distributionCount > 0 || !selectedProduct)
    .map(
      ({
        product,
        distributionCount,
        totalClicks,
        totalOrders,
        totalCommission,
      }) => {
        return {
          id: product.id,
          productName: product.productName,
          brand: product.brand,
          category: product.category || "Lainnya",
          price: Number(product.price),
          commissionRate: Number(product.commissionRate),
          distributionCount,
          totalClicks,
          clicksPerDistribution: calculateEfficiency(
            totalClicks,
            distributionCount
          ),
          totalOrders,
          ordersPerDistribution: calculateEfficiency(
            totalOrders,
            distributionCount
          ),
          cvr: calculateConversionRate(totalOrders, totalClicks),
          totalCommission,
          commissionPerDistribution: calculateEfficiency(
            totalCommission,
            distributionCount
          ),
          epc: calculateEPC(totalCommission, totalClicks),
        };
      }
    )
    .sort(
      (a, b) =>
        b.totalCommission - a.totalCommission || b.totalClicks - a.totalClicks
    );

  // ----------------------------------------------------
  // 3. CHANNEL / GROUP EFFICIENCY AGGREGATION
  // ----------------------------------------------------
  const channelAggregationMap = new Map<
    string,
    {
      platform: (typeof allPlatforms)[0];
      distributionCount: number;
      totalClicks: number;
      totalOrders: number;
      totalCommission: number;
    }
  >();

  for (const pl of allPlatforms) {
    channelAggregationMap.set(pl.id, {
      platform: pl,
      distributionCount: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalCommission: 0,
    });
  }

  for (const dist of filteredDistributions) {
    const eng = dist.engagements[0];
    const clicks = eng?.clicksCount || 0;
    const orders = eng?.ordersCount || 0;
    const entry = channelAggregationMap.get(dist.platform.id);
    if (entry) {
      entry.distributionCount += 1;
      entry.totalClicks += clicks;
      entry.totalOrders += orders;
      if (eng?.actualCommission != null) {
        entry.totalCommission += Number(eng.actualCommission);
      } else if (orders > 0 && dist.items.length > 0) {
        const avgComm =
          dist.items.reduce(
            (sum, item) =>
              sum +
              (Number(item.product.price) *
                Number(item.product.commissionRate)) /
                100,
            0
          ) / dist.items.length;
        entry.totalCommission += orders * avgComm;
      }
    }
  }

  const channelEfficiencyItems: ChannelEfficiencyItem[] = Array.from(
    channelAggregationMap.values()
  )
    .filter((ch) => ch.distributionCount > 0 || !selectedChannel)
    .map(
      ({
        platform,
        distributionCount,
        totalClicks,
        totalOrders,
        totalCommission,
      }) => {
        return {
          id: platform.id,
          name: platform.name,
          platformType: platform.platformType,
          distributionCount,
          totalClicks,
          clicksPerDistribution: calculateEfficiency(
            totalClicks,
            distributionCount
          ),
          totalOrders,
          cvr: calculateConversionRate(totalOrders, totalClicks),
          totalCommission,
          commissionPerDistribution: calculateEfficiency(
            totalCommission,
            distributionCount
          ),
          epc: calculateEPC(totalCommission, totalClicks),
        };
      }
    )
    .sort(
      (a, b) =>
        b.totalCommission - a.totalCommission ||
        b.clicksPerDistribution - a.clicksPerDistribution
    );

  // ----------------------------------------------------
  // 4. CHARTS: Publishing Trend & Niche Performance
  // ----------------------------------------------------
  const activityTrendData = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agt",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  for (let i = 13; i >= 0; i--) {
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - i
    );
    const yyyy = targetDate.getFullYear();
    const mm = targetDate.getMonth();
    const dd = targetDate.getDate();

    const distsOnDay = filteredDistributions.filter((d) => {
      const dt = new Date(d.postedAt);
      return (
        dt.getFullYear() === yyyy &&
        dt.getMonth() === mm &&
        dt.getDate() === dd
      );
    }).length;

    const contentsOnDay = filteredContents.filter((c) => {
      const dt = new Date(c.publishedAt);
      return (
        dt.getFullYear() === yyyy &&
        dt.getMonth() === mm &&
        dt.getDate() === dd
      );
    }).length;

    activityTrendData.push({
      date: `${dd} ${monthShort[mm]}`,
      fullDate: `${dayNames[targetDate.getDay()]}, ${dd} ${
        monthShort[mm]
      } ${yyyy}`,
      distributions: distsOnDay,
      contents: contentsOnDay,
    });
  }

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

  for (const prod of allProducts) {
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
  }

  for (const dist of filteredDistributions) {
    const latest = dist.engagements[0];
    if (latest) {
      for (const item of dist.items) {
        const cat = item.product.category || "Lainnya";
        if (categoryMap.has(cat)) {
          const cObj = categoryMap.get(cat)!;
          cObj.distributionCount += 1;
          cObj.totalClicks += latest.clicksCount || 0;
          cObj.totalOrders += latest.ordersCount || 0;
          if (latest.actualCommission != null) {
            cObj.estimatedEarnings +=
              Number(latest.actualCommission) / dist.items.length;
          } else if (latest.ordersCount && latest.ordersCount > 0) {
            const comm =
              (Number(item.product.price) *
                Number(item.product.commissionRate)) /
              100;
            cObj.estimatedEarnings += latest.ordersCount * comm;
          }
        }
      }
    }
  }

  const nichePerformanceData = Array.from(categoryMap.values())
    .sort(
      (a, b) =>
        b.estimatedEarnings - a.estimatedEarnings ||
        b.totalClicks - a.totalClicks
    )
    .slice(0, 6);

  // Platform Distribution Pie Chart Data
  const platformCounts: Record<string, number> = {
    facebook: 0,
    instagram: 0,
    threads: 0,
    tiktok: 0,
    other: 0,
  };

  for (const dist of filteredDistributions) {
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

  // Top performers
  const topProducts = productAnalyticsItems.slice(0, 5);
  const topPlatforms = channelEfficiencyItems.slice(0, 5).map((ch) => ({
    id: ch.id,
    name: ch.name,
    platformType: ch.platformType,
    distributionCount: ch.distributionCount,
    totalViews: 0,
    totalClicks: ch.totalClicks,
  }));

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
              AFM Decision Support System &nbsp;-&nbsp; Content to Sales Analytics
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Halo, {user?.name || "Partner"}! 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
              Analisa arus komersial affiliate, temukan bottleneck konversi, dan ukur efisiensi per sebaran link serta performa video AI secara real-time.
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

        {/* Global Analytics Filter Bar */}
        <GlobalAnalyticsFilter
          platformTypes={platformTypesList}
          channels={allPlatforms.map((p) => ({ id: p.id, name: p.name }))}
          products={allProducts.map((p) => ({
            id: p.id,
            name: p.productName,
          }))}
          personas={allPersonas.map((p) => ({ id: p.id, name: p.name }))}
        />

        {/* Section 1: Business Overview (4 Throughput Cards + Parallel Interaction Bar) */}
        <BusinessOverview metrics={businessOverviewMetrics} />

        {/* Section 2: Affiliate Conversion Funnel */}
        <AffiliateFunnelCard data={affiliateFunnelData} />

        {/* Section 3: Visual Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityPublishingTrend data={activityTrendData} />
          <NichePerformanceChart data={nichePerformanceData} />
        </div>

        {/* Section 4: Content AI Creative Performance & Diagnostics */}
        <ContentPerformanceTable contents={contentPerformanceItems} />

        {/* Section 5: Product Efficiency Analytics Table */}
        <ProductAnalyticsTable products={productAnalyticsItems} />

        {/* Section 6: Channel & Group Efficiency Table */}
        <ChannelEfficiencyTable channels={channelEfficiencyItems} />

        {/* Section 7: Top Performers & Platform Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPerformers topProducts={topProducts} topPlatforms={topPlatforms} />
          <PlatformDistributionChart data={platformChartData} />
        </div>

        {/* Section 8: Recent Activity Card */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Share2 className="w-4 h-4 text-primary" />
                    Aktivitas Sebar Link Terkini
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Sebaran link terbaru yang telah diposting ke grup sasaran
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
              {recentDistributions.length === 0 ? (
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
                          {dist.items
                            .map((i) => i.product.productName)
                            .join(", ")}
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
      </main>
    </div>
  );
}
