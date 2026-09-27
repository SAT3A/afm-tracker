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
  category?: string | null;
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
  personaId?: string;
  contentId?: string | null;
  distributionType?: string;
  platform: RawPlatform;
  persona: { id: string; name: string };
  content?: {
    id: string;
    title: string;
    contentType: string;
  } | null;
  postedAt: Date | string;
  status: string;
  postUrl?: string | null;
  metricBasis?: MetricBasis;
  items: Array<{
    productId?: string;
    product?: RawProduct;
  }>;
  engagements: Array<{
    viewsCount: number;
    likesCount: number;
    sharesCount: number;
    clicksCount: number;
    ordersCount?: number | null;
    actualCommission?: number | string | null;
    metricBasis?: MetricBasis;
  }>;
}

export type CommissionProvenance =
  | "ACTUAL"
  | "ESTIMATED"
  | "MIXED"
  | "PARTIAL"
  | "UNAVAILABLE";

export interface ContentDistributionBreakdownItem {
  distributionId: string;
  platformId: string;
  platformName: string;
  platformType: string;
  distributionType: string;
  postUrl?: string | null;
  postedAt: Date | string;
  status: string;
  productCount: number;
  productNames: string[];
  reach: number;
  reachBasis: MetricBasis;
  clicks: number;
  ctr: number | null;
  orders: number;
  cvr: number;
  commission: number | null;
  commissionProvenance: CommissionProvenance;
  epc: number | null;
}

export interface ContentDistributionSummary {
  contentId: string;
  contentTitle: string;
  contentType: string;
  totalDistributions: number;
  totalReach: number;
  reachBasis: MetricBasis;
  totalClicks: number;
  overallCtr: number | null;
  totalOrders: number;
  overallCvr: number;
  totalCommission: number | null;
  commissionProvenance: CommissionProvenance;
  overallEpc: number | null;
  breakdown: ContentDistributionBreakdownItem[];
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
  isEstimatedCommission?: boolean;
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

export interface SocialResonanceItem {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  total: number;
  rate: number | null;
  basis: MetricBasis;
}

export interface DistributionResonanceItem {
  likes: number;
  shares: number;
  total: number;
  rate: number | null;
  basis: MetricBasis;
}

export interface AggregationOutput {
  businessOverview: {
    totalReach: number;
    videoViews: number;
    postImpressions: number;
    reachBasis: MetricBasis;
    hasDistributionData: boolean;
    dataNotice?: string;
    // Option A: Separated Social Resonances (No blind summing!)
    contentEngagement: SocialResonanceItem;
    distributionEngagement: DistributionResonanceItem;
    totalEngagements: number;
    engagementRate: number | null;
    affiliateClicks: number;
    affiliateCTR: number | null;
    orders: number;
    conversionRate: number;
    commission: number;
    epc: number;
    canonicalCommercialSource: "DistributionEngagement";
  };
  affiliateFunnel: {
    reach: number;
    videoViews: number;
    postImpressions: number;
    reachBasis: MetricBasis;
    hasDistributionData: boolean;
    dataNotice?: string;
    clicks: number;
    orders: number;
    commission: number;
    epc: number;
    ctr: number | null;
    cvr: number;
    engagements: SocialResonanceItem;
    distributionEngagements: DistributionResonanceItem;
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
 * Safely extracts the latest engagement snapshot for a distribution by capturedAt/createdAt.
 * Avoids assuming array ordering and prevents double-counting cumulative metric snapshots.
 */
export function getLatestDistributionEngagement<
  T extends {
    capturedAt?: Date | string | null;
    createdAt?: Date | string | null;
    viewsCount?: number;
    clicksCount?: number;
    ordersCount?: number | null;
    actualCommission?: number | string | null;
    likesCount?: number;
    sharesCount?: number;
    metricBasis?: MetricBasis;
  }
>(engagements?: T[] | null): T | null {
  if (!engagements || engagements.length === 0) return null;
  if (engagements.length === 1) return engagements[0];

  return engagements.reduce((latest, current) => {
    const latestTime = latest.capturedAt
      ? new Date(latest.capturedAt).getTime()
      : latest.createdAt
      ? new Date(latest.createdAt).getTime()
      : 0;
    const currentTime = current.capturedAt
      ? new Date(current.capturedAt).getTime()
      : current.createdAt
      ? new Date(current.createdAt).getTime()
      : 0;
    return currentTime >= latestTime ? current : latest;
  }, engagements[0]);
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
  let totalContentVideoViews = 0;
  let totalContentImpressions = 0;
  let totalContentLikes = 0;
  let totalContentComments = 0;
  let totalContentShares = 0;
  let totalContentSaves = 0;

  let hasViewsContent = false;
  let hasImpressionsContent = false;

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

    const basis: MetricBasis = getContentMetricBasis(c.contentType);
    if (basis === "views") {
      hasViewsContent = true;
      totalContentVideoViews += views;
    } else {
      hasImpressionsContent = true;
      totalContentImpressions += views;
    }

    totalContentLikes += likes;
    totalContentComments += comments;
    totalContentShares += shares;
    totalContentSaves += saves;

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
      hasEstimatedCommission: boolean;
    }
  >();

  for (const p of allProducts) {
    singleProductMap.set(p.id, {
      product: p,
      distributionCount: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalCommission: 0,
      hasEstimatedCommission: false,
    });
  }

  let unallocatedClicks = 0;
  let unallocatedOrders = 0;
  let unallocatedCommission = 0;
  let unallocatedDistCount = 0;

  for (const dist of distributions) {
    const eng = getLatestDistributionEngagement(dist.engagements);
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
    let isDistActualComm = false;
    if (eng?.actualCommission != null) {
      distComm = Number(eng.actualCommission);
      isDistActualComm = true;
    } else if (orders > 0 && dist.items.length === 1) {
      const p =
        dist.items[0].product ||
        allProducts.find((prod) => prod.id === dist.items[0].productId);
      if (p) {
        distComm = (orders * Number(p.price) * Number(p.commissionRate)) / 100;
        isDistActualComm = false;
      }
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
      const pId = dist.items[0].product?.id || dist.items[0].productId;
      if (pId) {
        const pEntry = singleProductMap.get(pId);
        if (pEntry) {
          pEntry.distributionCount += 1;
          pEntry.totalClicks += clicks;
          pEntry.totalOrders += orders;
          pEntry.totalCommission += distComm;
          if (!isDistActualComm && orders > 0) {
            pEntry.hasEstimatedCommission = true;
          }
        }
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
    .map(({ product, distributionCount, totalClicks, totalOrders, totalCommission, hasEstimatedCommission }) => {
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
        isEstimatedCommission: hasEstimatedCommission,
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
  // 3. BUSINESS OVERVIEW & AFFILIATE FUNNEL (Canonical Commercial Throughput)
  // -------------------------------------------------------------------------
  // Rule: Do NOT make the semantic definition of Business Overview commercial KPIs
  // change depending on whether distributions exist.
  // Stable Canonical Source: DistributionEngagement
  // If no attributed Distribution data exists, show 0 / N/A with notice "Belum ada data distribusi teratribusi."
  const hasDistributionData = distributions.length > 0;
  const canonicalCommercialSource = "DistributionEngagement" as const;
  const dataNotice = !hasDistributionData
    ? "Belum ada data distribusi teratribusi."
    : undefined;

  // Commercial KPIs are strictly derived from DistributionEngagement (never fallback to ContentMetric)
  const affiliateClicks = totalDistClicks;
  const orders = totalDistOrders;
  const commission = totalDistCommission;

  // Total Reach Observation (Informational aggregate)
  const totalVideoViews = totalContentVideoViews;
  const totalContentReach = totalContentVideoViews + totalContentImpressions;
  const totalReach = totalContentReach + totalPostImpressions;

  let reachBasis: MetricBasis = "views";
  const hasViewsBasis = totalContentVideoViews > 0;
  const hasImpressionsBasis = totalContentImpressions > 0 || totalPostImpressions > 0;

  if (hasViewsBasis && hasImpressionsBasis) {
    reachBasis = "mixed";
  } else if (hasImpressionsBasis) {
    reachBasis = "impressions";
  } else {
    reachBasis = "views";
  }

  // -------------------------------------------------------------------------
  // SOCIAL ENGAGEMENT (Option A: Separated without Blind Summing)
  // -------------------------------------------------------------------------
  // 1. Content Social Engagement (from ContentMetric)
  const contentLikes = totalContentLikes;
  const contentComments = totalContentComments;
  const contentShares = totalContentShares;
  const contentSaves = totalContentSaves;
  const totalContentEngagements =
    contentLikes + contentComments + contentShares + contentSaves;

  let contentBasis: MetricBasis = "views";
  let contentER: number | null = null;
  if (hasViewsContent && hasImpressionsContent) {
    contentBasis = "mixed";
    contentER = null;
  } else if (hasImpressionsContent) {
    contentBasis = "impressions";
    contentER =
      totalContentImpressions > 0
        ? calculateEngagementRate(totalContentEngagements, totalContentImpressions, "impressions").rate
        : 0;
  } else if (hasViewsContent) {
    contentBasis = "views";
    contentER =
      totalContentVideoViews > 0
        ? calculateEngagementRate(totalContentEngagements, totalContentVideoViews, "views").rate
        : 0;
  } else {
    contentBasis = "views";
    contentER = 0;
  }

  const contentEngagement: SocialResonanceItem = {
    likes: contentLikes,
    comments: contentComments,
    shares: contentShares,
    saves: contentSaves,
    total: totalContentEngagements,
    rate: contentER,
    basis: contentBasis,
  };

  // 2. Distribution Social Engagement (from DistributionEngagement placements)
  const distLikes = totalDistLikes;
  const distShares = totalDistShares;
  const totalDistEngagements = distLikes + distShares;
  const distER =
    totalPostImpressions > 0
      ? calculateEngagementRate(totalDistEngagements, totalPostImpressions, "impressions").rate
      : 0;

  const distributionEngagement: DistributionResonanceItem = {
    likes: distLikes,
    shares: distShares,
    total: totalDistEngagements,
    rate: distER,
    basis: "impressions",
  };

  // When reachBasis is "mixed" or no distribution data, affiliate CTR is guarded:
  const affiliateCTR =
    !hasDistributionData || reachBasis === "mixed"
      ? null
      : calculateCTR(affiliateClicks, totalReach, reachBasis).ctr;

  const conversionRate = hasDistributionData
    ? calculateConversionRate(orders, affiliateClicks)
    : 0;
  const epc = hasDistributionData
    ? calculateEPC(commission, affiliateClicks)
    : 0;

  const universalER =
    reachBasis === "mixed" || contentBasis === "mixed"
      ? null
      : reachBasis === "views"
      ? contentER
      : distER;

  return {
    businessOverview: {
      totalReach,
      videoViews: totalVideoViews,
      postImpressions: totalPostImpressions,
      reachBasis,
      hasDistributionData,
      dataNotice,
      contentEngagement,
      distributionEngagement,
      totalEngagements: totalContentEngagements,
      engagementRate: universalER,
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
      hasDistributionData,
      dataNotice,
      clicks: affiliateClicks,
      orders,
      commission,
      epc,
      ctr: affiliateCTR,
      cvr: conversionRate,
      engagements: contentEngagement,
      distributionEngagements: distributionEngagement,
    },
    contentPerformance,
    productAnalytics,
    channelEfficiency,
  };
}

/**
 * Determines content metric basis (views vs impressions) preserved from Phase 1.
 * Does not assume all content records are videos.
 */
export function getContentMetricBasis(contentType: string): MetricBasis {
  const t = (contentType || "").toLowerCase();
  if (
    t.includes("video") ||
    t.includes("reels") ||
    t.includes("tiktok") ||
    t.includes("youtube") ||
    t.includes("shorts")
  ) {
    return "views";
  }
  return "impressions";
}

/**
 * Resolves the reach basis for a distribution placement.
 *
 * Denominator Semantics (Phase 2 Locked):
 * A Distribution's denominator represents the DISTRIBUTION PLACEMENT, not automatically
 * inheriting the format of its source creative.
 * ContentMetric metricBasis and DistributionEngagement metricBasis remain independent concepts.
 *
 * Deterministic Resolution Rules:
 * 1. Explicit metadata: If distribution or engagement has an explicit metricBasis, respect it.
 * 2. Distribution Type: Comments in posts/threads are strictly impression-based ("impressions").
 * 3. Video-native placements: Platforms and channels whose primary consumption metric is video plays
 *    (e.g., tiktok, youtube, shopee_video, reels-only accounts) resolve to "views".
 * 4. Group / Community / Feed / Chat placements: Placements whose primary consumption metric is
 *    post reach/impressions (e.g. facebook groups/pages, threads, telegram, whatsapp, twitter)
 *    resolve to "impressions".
 */
export function resolveDistributionReachBasis(
  distOrContent: RawDistributionItem | RawContentItem,
  maybeContentOrDist?: RawContentItem | RawDistributionItem
): MetricBasis {
  let dist: RawDistributionItem | undefined;
  let content: RawContentItem | undefined;

  // Support both (dist, content) and legacy (content, dist) invocations
  if (distOrContent && ("platform" in distOrContent || "distributionType" in distOrContent)) {
    dist = distOrContent as RawDistributionItem;
    content = maybeContentOrDist as RawContentItem | undefined;
  } else if (maybeContentOrDist && ("platform" in maybeContentOrDist || "distributionType" in maybeContentOrDist)) {
    dist = maybeContentOrDist as RawDistributionItem;
    content = distOrContent as RawContentItem;
  } else if (distOrContent && "contentType" in distOrContent) {
    content = distOrContent as RawContentItem;
  }

  // 1. Explicit metadata on distribution or its latest engagement
  const explicitDistBasis = dist?.metricBasis;
  if (explicitDistBasis === "views" || explicitDistBasis === "impressions" || explicitDistBasis === "mixed") {
    return explicitDistBasis;
  }
  const explicitEngBasis = dist?.engagements?.[0]?.metricBasis;
  if (explicitEngBasis === "views" || explicitEngBasis === "impressions" || explicitEngBasis === "mixed") {
    return explicitEngBasis;
  }

  // If no distribution placement context is available at all, fallback to content
  if (!dist) {
    return content ? getContentMetricBasis(content.contentType) : "impressions";
  }

  // 2. Distribution Type: Comments in third-party posts/threads are always impression-based
  const dType = (dist.distributionType || "").toLowerCase().trim();
  if (dType === "comment") {
    return "impressions";
  }

  // 3. Placement Platform & Channel Semantics
  const pType = (dist.platform?.platformType || "").toLowerCase().trim();
  const pName = (dist.platform?.name || "").toLowerCase().trim();
  const pCategory = (dist.platform?.category || "").toLowerCase().trim();

  // A) Video-native placements (where reach = video plays)
  const isVideoPlacement =
    pType === "tiktok" ||
    pType === "shopee_video" ||
    pType === "youtube" ||
    pName.includes("tiktok") ||
    pName.includes("reels") ||
    pName.includes("shorts") ||
    pCategory.includes("reels") ||
    (pName.includes("video") && !pName.includes("grup") && !pName.includes("group"));

  if (isVideoPlacement) {
    return "views";
  }

  // B) Placements whose native placement reach is impressions
  // (Facebook groups/pages, Threads feeds, Telegram/WhatsApp groups/broadcasts, Twitter/X)
  const isImpressionsPlacement =
    pType === "facebook" ||
    pType === "threads" ||
    pType === "telegram" ||
    pType === "whatsapp" ||
    pType === "twitter" ||
    pType === "x" ||
    pName.includes("grup") ||
    pName.includes("group") ||
    pName.includes("komunitas") ||
    pName.includes("community") ||
    pName.includes("forum") ||
    pName.includes("feed") ||
    pName.includes("chat") ||
    pName.includes("channel") ||
    pName.includes("utas") ||
    pName.includes("thread") ||
    pCategory.includes("grup") ||
    pCategory.includes("group");

  if (isImpressionsPlacement) {
    return "impressions";
  }

  // C) Default for general distribution placements (posts into groups/feeds/pages)
  return "impressions";
}

/**
 * Aggregates all distribution placements linked to a specific content item.
 * Preserves Phase 1 rules:
 * - Zero double-counting between ContentMetric and DistributionEngagement.
 * - Single-product commission estimation allowed only when distribution has exactly 1 attributed product.
 * - Multi-product distributions without actual commission yield UNAVAILABLE.
 * - Preserves commission provenance: ACTUAL, ESTIMATED, MIXED, PARTIAL, UNAVAILABLE.
 * - Resolves reach basis and suppresses overall CTR on Mixed Basis.
 */
export function aggregateContentDistributionBreakdown(params: {
  content: RawContentItem;
  distributions: RawDistributionItem[];
  allProducts?: RawProduct[];
}): ContentDistributionSummary {
  const { content, distributions, allProducts } = params;

  // Filter only distributions linked to this content
  const linked = distributions.filter((d) => d.contentId === content.id);

  let totalReach = 0;
  let totalClicks = 0;
  let totalOrders = 0;
  let totalCommission: number | null = 0;

  let hasActual = false;
  let hasEstimated = false;
  let hasUnavailable = false;

  const basesEncountered = new Set<MetricBasis>();

  const breakdown: ContentDistributionBreakdownItem[] = linked.map((dist) => {
    const reachBasis = resolveDistributionReachBasis(dist, content);
    basesEncountered.add(reachBasis);

    const latestEng = getLatestDistributionEngagement(dist.engagements);
    const distReach = Number(latestEng?.viewsCount) || 0;
    const distClicks = Number(latestEng?.clicksCount) || 0;
    const distOrders = Number(latestEng?.ordersCount) || 0;

    // Commission & provenance for this individual distribution
    let distCommission: number | null = null;
    let distProvenance: CommissionProvenance = "UNAVAILABLE";

    if (latestEng?.actualCommission != null && latestEng.actualCommission !== "") {
      distCommission = Number(latestEng.actualCommission);
      distProvenance = "ACTUAL";
    } else if (distOrders === 0) {
      distCommission = 0;
      distProvenance = "ACTUAL";
    } else {
      // distOrders > 0 and no actualCommission
      const items = dist.items || [];
      if (items.length === 1) {
        const itemProd =
          items[0].product ||
          allProducts?.find((p) => p.id === items[0].productId);
        if (itemProd) {
          distCommission =
            (distOrders *
              Number(itemProd.price) *
              Number(itemProd.commissionRate)) /
            100;
          distProvenance = "ESTIMATED";
        } else {
          distCommission = null;
          distProvenance = "UNAVAILABLE";
        }
      } else {
        // Multi-product unallocated or no product attached
        distCommission = null;
        distProvenance = "UNAVAILABLE";
      }
    }

    // Accumulate summary trackers
    totalReach += distReach;
    totalClicks += distClicks;
    totalOrders += distOrders;

    if (distProvenance === "ACTUAL") {
      if (distCommission != null && distCommission > 0) {
        hasActual = true;
        totalCommission = (totalCommission ?? 0) + distCommission;
      }
    } else if (distProvenance === "ESTIMATED") {
      if (distCommission != null) {
        hasEstimated = true;
        totalCommission = (totalCommission ?? 0) + distCommission;
      }
    } else if (distProvenance === "UNAVAILABLE" && distOrders > 0) {
      hasUnavailable = true;
    }

    const ctr = calculateCTR(distClicks, distReach, reachBasis).ctr;
    const cvr = calculateConversionRate(distOrders, distClicks);
    const epc =
      distCommission != null ? calculateEPC(distCommission, distClicks) : null;

    const productNames = (dist.items || [])
      .map(
        (i) =>
          i.product?.productName ||
          allProducts?.find((p) => p.id === i.productId)?.productName
      )
      .filter((name): name is string => Boolean(name));

    return {
      distributionId: dist.id,
      platformId: dist.platformId,
      platformName: dist.platform?.name || "Unknown Platform",
      platformType: dist.platform?.platformType || "unknown",
      distributionType: dist.distributionType || "post",
      postUrl: dist.postUrl,
      postedAt: dist.postedAt,
      status: dist.status,
      productCount: (dist.items || []).length,
      productNames,
      reach: distReach,
      reachBasis,
      clicks: distClicks,
      ctr,
      orders: distOrders,
      cvr,
      commission: distCommission,
      commissionProvenance: distProvenance,
      epc,
    };
  });

  // Determine summary reach basis
  let summaryReachBasis: MetricBasis;
  if (breakdown.length === 0) {
    summaryReachBasis = getContentMetricBasis(content.contentType);
  } else if (basesEncountered.size > 1) {
    summaryReachBasis = "mixed";
  } else if (basesEncountered.has("impressions")) {
    summaryReachBasis = "impressions";
  } else {
    summaryReachBasis = "views";
  }

  // Determine summary commission provenance
  let summaryProvenance: CommissionProvenance = "ACTUAL";
  if (breakdown.length === 0) {
    summaryProvenance = "UNAVAILABLE";
    totalCommission = null;
  } else if (hasUnavailable) {
    if (hasActual || hasEstimated) {
      summaryProvenance = "PARTIAL";
    } else {
      summaryProvenance = "UNAVAILABLE";
      totalCommission = null;
    }
  } else if (hasActual && hasEstimated) {
    summaryProvenance = "MIXED";
  } else if (hasEstimated) {
    summaryProvenance = "ESTIMATED";
  } else if (hasActual) {
    summaryProvenance = "ACTUAL";
  } else {
    // Zero orders / zero commissions
    summaryProvenance = "ACTUAL";
    totalCommission = 0;
  }

  const overallCtr =
    summaryReachBasis === "mixed"
      ? null
      : calculateCTR(totalClicks, totalReach, summaryReachBasis).ctr;
  const overallCvr = calculateConversionRate(totalOrders, totalClicks);
  const overallEpc =
    summaryProvenance === "PARTIAL" || summaryProvenance === "UNAVAILABLE"
      ? null
      : totalCommission != null
      ? calculateEPC(totalCommission, totalClicks)
      : null;

  return {
    contentId: content.id,
    contentTitle: content.title,
    contentType: content.contentType,
    totalDistributions: breakdown.length,
    totalReach,
    reachBasis: summaryReachBasis,
    totalClicks,
    overallCtr,
    totalOrders,
    overallCvr,
    totalCommission,
    commissionProvenance: summaryProvenance,
    overallEpc,
    breakdown,
  };
}
