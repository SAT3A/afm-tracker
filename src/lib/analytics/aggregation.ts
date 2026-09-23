/**
 * AFM Tracker — Centralized Aggregation & Canonical Attribution Engine
 *
 * Implements deterministic attribution boundaries, prevents double-counting
 * between ContentMetric and DistributionEngagement, enforces single-product attribution,
 * and handles Mixed Basis denominators transparently.
 */

import {
  calculateEngagementRate,
  calculateCTR,
  calculateConversionRate,
  calculateEPC,
  calculateEfficiency,
} from "./metrics.ts";
import {
  diagnoseContentPerformance,
  type DiagnosisStatus,
} from "./diagnostics.ts";
import type { MetricBasis } from "./config.ts";

export interface RawProduct {
  id: string;
  productName: string;
  brand: string;
  price: number | string;
  commissionRate: number | string;
  category?: string | null;
  status?: string;
}

export interface RawPlatform {
  id: string;
  name: string;
  platformType: string;
  status?: string;
}

export interface RawContentItem {
  id: string;
  title: string;
  contentType: string;
  platformUrl?: string | null;
  publishedAt: Date | string;
  persona: { id: string; name: string };
  products: Array<{
    product: RawProduct;
  }>;
  metrics: Array<{
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount?: number | null;
    clicksCount?: number | null;
    ordersCount?: number | null;
    actualCommission?: number | string | null;
  }>;
}

export interface RawDistributionItem {
  id: string;
  platformId: string;
  platform: RawPlatform;
  persona: { id: string; name: string };
  postedAt: Date | string;
  status: string;
  postUrl?: string | null;
  items: Array<{
    product: RawProduct;
  }>;
  engagements: Array<{
    viewsCount: number;
    likesCount: number;
    sharesCount: number;
    clicksCount: number;
    ordersCount?: number | null;
    actualCommission?: number | string | null;
  }>;
}

export interface ContentPerformanceResult {
  id: string;
  title: string;
  contentType: string;
  platformUrl?: string | null;
  publishedAt: Date | string;
  personaName: string;
  productNames: string[];
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  orders: number;
  commission: number | null;
  isActualCommission: boolean;
  er: number | null;
  ctr: number | null;
  cvr: number;
  epc: number;
  metricBasis: MetricBasis;
  diagnosisStatus: DiagnosisStatus;
  diagnosisBadge: string;
  possibleBottleneck: string | null;
  suggestedTest: string | null;
}

export interface ProductAnalyticsResult {
  id: string;
  productName: string;
  brand: string;
  category: string;
  price: number;
  commissionRate: number;
  distributionCount: number;
  totalClicks: number;
  clicksPerDistribution: number;
  totalOrders: number;
  ordersPerDistribution: number;
  cvr: number;
  totalCommission: number | null;
  commissionPerDistribution: number;
  epc: number;
  isUnallocatedBucket?: boolean;
}

export interface ChannelEfficiencyResult {
  id: string;
  name: string;
  platformType: string;
  distributionCount: number;
  totalClicks: number;
  clicksPerDistribution: number;
  totalOrders: number;
  cvr: number;
  totalCommission: number;
  commissionPerDistribution: number;
  epc: number;
}

export interface AggregationOutput {
  businessOverview: {
    totalReach: number;
    videoViews: number;
    postImpressions: number;
    reachBasis: MetricBasis;
    totalEngagements: number;
    engagementRate: number | null;
    affiliateClicks: number;
    affiliateCTR: number | null;
    orders: number;
    conversionRate: number;
    commission: number;
    epc: number;
    canonicalCommercialSource: "DistributionEngagement" | "ContentMetric";
  };
  affiliateFunnel: {
    reach: number;
    videoViews: number;
    postImpressions: number;
    reachBasis: MetricBasis;
    clicks: number;
    orders: number;
    commission: number;
    epc: number;
    ctr: number | null;
    cvr: number;
    engagements: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      total: number;
      rate: number | null;
    };
  };
  contentPerformance: ContentPerformanceResult[];
  productAnalytics: ProductAnalyticsResult[];
  channelEfficiency: ChannelEfficiencyResult[];
}

/**
 * Normalizes user-selected platform filter to matching contentType codes.
 */
export function normalizePlatformToContentTypes(platform: string): string[] {
  const p = platform.toLowerCase();
  switch (p) {
    case "facebook":
      return ["fb_reels", "facebook"];
    case "instagram":
      return ["ig_reels", "instagram"];
    case "shopee":
      return ["shopee_video", "shopee"];
    case "tiktok":
      return ["tiktok"];
    case "threads":
      return ["threads"];
    default:
      return [p];
  }
}

/**
 * Centralized, pure aggregation function.
 * Enforces canonical attribution rules without heuristic or fuzzy deduplication.
 */
export function aggregateDashboardMetrics(params: {
  contents: RawContentItem[];
  distributions: RawDistributionItem[];
  allProducts: RawProduct[];
  allPlatforms: RawPlatform[];
}): AggregationOutput {
  const { contents, distributions, allProducts, allPlatforms } = params;

  // -------------------------------------------------------------------------
  // 1. CONTENT PERFORMANCE (Canonical: Content + ContentMetric)
  // -------------------------------------------------------------------------
  let totalVideoViews = 0;
  let totalContentLikes = 0;
  let totalContentComments = 0;
  let totalContentShares = 0;
  let totalContentSaves = 0;
  let totalContentClicks = 0;
  let totalContentOrders = 0;
  let totalContentCommission = 0;

  const contentPerformance: ContentPerformanceResult[] = contents.map((c) => {
    const metric = c.metrics[0];
    const views = metric?.viewsCount || 0;
    const likes = metric?.likesCount || 0;
    const comments = metric?.commentsCount || 0;
    const shares = metric?.sharesCount || 0;
    const saves = metric?.savesCount || 0;
    const clicks = metric?.clicksCount || 0;
    const orders = metric?.ordersCount || 0;
    const totalEng = likes + comments + shares + saves;

    totalVideoViews += views;
    totalContentLikes += likes;
    totalContentComments += comments;
    totalContentShares += shares;
    totalContentSaves += saves;
    totalContentClicks += clicks;
    totalContentOrders += orders;

    // Commission logic:
    // 1. Prefer actualCommission if present
    // 2. If missing and single product, compute explicit estimate
    // 3. If missing and multi-product, return null (N/A) to prevent blind averaging
    let commission: number | null = null;
    let isActualCommission = false;

    if (metric?.actualCommission != null) {
      commission = Number(metric.actualCommission);
      isActualCommission = true;
    } else if (orders > 0) {
      if (c.products.length === 1) {
        const p = c.products[0].product;
        commission = (orders * Number(p.price) * Number(p.commissionRate)) / 100;
        isActualCommission = false;
      } else {
        // Multi-product with unknown distribution: N/A
        commission = null;
        isActualCommission = false;
      }
    } else {
      commission = 0;
      isActualCommission = false;
    }

    if (commission != null) {
      totalContentCommission += commission;
    }

    const basis: MetricBasis =
      c.contentType.includes("video") ||
      c.contentType.includes("reels") ||
      c.contentType.includes("tiktok")
        ? "views"
        : "impressions";

    const er = calculateEngagementRate(totalEng, views, basis).rate;
    const ctr = calculateCTR(clicks, views, basis).ctr;
    const cvr = calculateConversionRate(orders, clicks);
    const epc = commission != null ? calculateEPC(commission, clicks) : 0;

    const diagnosis = diagnoseContentPerformance({
      metricBasis: basis,
      reach: views,
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
      commission,
      isActualCommission,
      er,
      ctr,
      cvr,
      epc,
      metricBasis: basis,
      diagnosisStatus: diagnosis.status,
      diagnosisBadge: diagnosis.badgeLabel,
      possibleBottleneck: diagnosis.possibleBottleneck,
      suggestedTest: diagnosis.suggestedTest,
    };
  });

  // -------------------------------------------------------------------------
  // 2. DISTRIBUTION & CHANNEL EFFICIENCY (Canonical: Distribution + DistributionEngagement)
  // -------------------------------------------------------------------------
  let totalPostImpressions = 0;
  let totalDistLikes = 0;
  let totalDistShares = 0;
  let totalDistClicks = 0;
  let totalDistOrders = 0;
  let totalDistCommission = 0;

  const channelMap = new Map<
    string,
    {
      platform: RawPlatform;
      distributionCount: number;
      totalClicks: number;
      totalOrders: number;
      totalCommission: number;
    }
  >();

  for (const pl of allPlatforms) {
    channelMap.set(pl.id, {
      platform: pl,
      distributionCount: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalCommission: 0,
    });
  }

  // Product attribution tracking:
  // - singleProductMap: products with exactly 1 attached item in distribution
  // - unallocatedBucket: multi-product distributions grouped together
  const singleProductMap = new Map<
    string,
    {
      product: RawProduct;
      distributionCount: number;
      totalClicks: number;
      totalOrders: number;
      totalCommission: number;
    }
  >();

  for (const p of allProducts) {
    singleProductMap.set(p.id, {
      product: p,
      distributionCount: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalCommission: 0,
    });
  }

  let unallocatedClicks = 0;
  let unallocatedOrders = 0;
  let unallocatedCommission = 0;
  let unallocatedDistCount = 0;

  for (const dist of distributions) {
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

    // Distribution commission resolution
    let distComm = 0;
    if (eng?.actualCommission != null) {
      distComm = Number(eng.actualCommission);
    } else if (orders > 0 && dist.items.length === 1) {
      const p = dist.items[0].product;
      distComm = (orders * Number(p.price) * Number(p.commissionRate)) / 100;
    }
    totalDistCommission += distComm;

    // Channel Aggregation
    const chEntry = channelMap.get(dist.platform.id);
    if (chEntry) {
      chEntry.distributionCount += 1;
      chEntry.totalClicks += clicks;
      chEntry.totalOrders += orders;
      chEntry.totalCommission += distComm;
    }

    // Product Attribution Guard (Anti-Phantom Multiplier)
    if (dist.items.length === 1) {
      const pId = dist.items[0].product.id;
      const pEntry = singleProductMap.get(pId);
      if (pEntry) {
        pEntry.distributionCount += 1;
        pEntry.totalClicks += clicks;
        pEntry.totalOrders += orders;
        pEntry.totalCommission += distComm;
      }
    } else if (dist.items.length > 1) {
      // Multi-product distribution: Placed into unallocated bucket, NOT multiplied across items!
      unallocatedDistCount += 1;
      unallocatedClicks += clicks;
      unallocatedOrders += orders;
      unallocatedCommission += distComm;
    }
  }

  const channelEfficiency: ChannelEfficiencyResult[] = Array.from(
    channelMap.values()
  )
    .filter((ch) => ch.distributionCount > 0)
    .map(({ platform, distributionCount, totalClicks, totalOrders, totalCommission }) => {
      return {
        id: platform.id,
        name: platform.name,
        platformType: platform.platformType,
        distributionCount,
        totalClicks,
        clicksPerDistribution: calculateEfficiency(totalClicks, distributionCount),
        totalOrders,
        cvr: calculateConversionRate(totalOrders, totalClicks),
        totalCommission,
        commissionPerDistribution: calculateEfficiency(totalCommission, distributionCount),
        epc: calculateEPC(totalCommission, totalClicks),
      };
    })
    .sort((a, b) => b.totalCommission - a.totalCommission || b.totalClicks - a.totalClicks);

  const productAnalytics: ProductAnalyticsResult[] = Array.from(
    singleProductMap.values()
  )
    .filter((p) => p.distributionCount > 0)
    .map(({ product, distributionCount, totalClicks, totalOrders, totalCommission }) => {
      return {
        id: product.id,
        productName: product.productName,
        brand: product.brand,
        category: product.category || "Lainnya",
        price: Number(product.price),
        commissionRate: Number(product.commissionRate),
        distributionCount,
        totalClicks,
        clicksPerDistribution: calculateEfficiency(totalClicks, distributionCount),
        totalOrders,
        ordersPerDistribution: calculateEfficiency(totalOrders, distributionCount),
        cvr: calculateConversionRate(totalOrders, totalClicks),
        totalCommission,
        commissionPerDistribution: calculateEfficiency(totalCommission, distributionCount),
        epc: calculateEPC(totalCommission, totalClicks),
      };
    })
    .sort((a, b) => (b.totalCommission ?? 0) - (a.totalCommission ?? 0) || b.totalClicks - a.totalClicks);

  // If there are multi-product distributions, append the single unallocated bucket
  if (unallocatedDistCount > 0) {
    productAnalytics.push({
      id: "unallocated-multi-product",
      productName: "Unallocated (Sebaran Multi-Produk)",
      brand: "Gabungan",
      category: "Multi-Produk",
      price: 0,
      commissionRate: 0,
      distributionCount: unallocatedDistCount,
      totalClicks: unallocatedClicks,
      clicksPerDistribution: calculateEfficiency(unallocatedClicks, unallocatedDistCount),
      totalOrders: unallocatedOrders,
      ordersPerDistribution: calculateEfficiency(unallocatedOrders, unallocatedDistCount),
      cvr: calculateConversionRate(unallocatedOrders, unallocatedClicks),
      totalCommission: unallocatedCommission,
      commissionPerDistribution: calculateEfficiency(unallocatedCommission, unallocatedDistCount),
      epc: calculateEPC(unallocatedCommission, unallocatedClicks),
      isUnallocatedBucket: true,
    });
  }

  // -------------------------------------------------------------------------
  // 3. BUSINESS OVERVIEW & AFFILIATE FUNNEL (Canonical Commercial Selection)
  // -------------------------------------------------------------------------
  // Rule: Do NOT sum ContentMetric and DistributionEngagement clicks/orders!
  // If distributions exist, DistributionEngagement is the canonical commercial throughput.
  // If zero distributions exist (e.g. Case A: Content-only), fallback to ContentMetric.
  const hasDistributions = distributions.length > 0;
  const canonicalCommercialSource = hasDistributions
    ? "DistributionEngagement"
    : "ContentMetric";

  const affiliateClicks = hasDistributions
    ? totalDistClicks
    : totalContentClicks;
  const orders = hasDistributions ? totalDistOrders : totalContentOrders;
  const commission = hasDistributions
    ? totalDistCommission
    : totalContentCommission;

  // Total Reach Observation (Informational aggregate)
  const totalReach = totalVideoViews + totalPostImpressions;
  let reachBasis: MetricBasis = "views";
  if (totalVideoViews > 0 && totalPostImpressions > 0) {
    reachBasis = "mixed";
  } else if (totalPostImpressions > 0) {
    reachBasis = "impressions";
  } else {
    reachBasis = "views";
  }

  // Parallel Social Interactions
  const totalLikes = totalContentLikes + totalDistLikes;
  const totalComments = totalContentComments;
  const totalShares = totalContentShares + totalDistShares;
  const totalSaves = totalContentSaves;
  const totalEngagements = totalLikes + totalComments + totalShares + totalSaves;

  // When reachBasis is "mixed", CTR and ER MUST NOT be calculated on a mixed denominator!
  const engagementRate =
    reachBasis === "mixed"
      ? null
      : calculateEngagementRate(totalEngagements, totalReach, reachBasis).rate;

  const affiliateCTR =
    reachBasis === "mixed"
      ? null
      : calculateCTR(affiliateClicks, totalReach, reachBasis).ctr;

  const conversionRate = calculateConversionRate(orders, affiliateClicks);
  const epc = calculateEPC(commission, affiliateClicks);

  return {
    businessOverview: {
      totalReach,
      videoViews: totalVideoViews,
      postImpressions: totalPostImpressions,
      reachBasis,
      totalEngagements,
      engagementRate,
      affiliateClicks,
      affiliateCTR,
      orders,
      conversionRate,
      commission,
      epc,
      canonicalCommercialSource,
    },
    affiliateFunnel: {
      reach: totalReach,
      videoViews: totalVideoViews,
      postImpressions: totalPostImpressions,
      reachBasis,
      clicks: affiliateClicks,
      orders,
      commission,
      epc,
      ctr: affiliateCTR,
      cvr: conversionRate,
      engagements: {
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
        total: totalEngagements,
        rate: engagementRate,
      },
    },
    contentPerformance,
    productAnalytics,
    channelEfficiency,
  };
}
