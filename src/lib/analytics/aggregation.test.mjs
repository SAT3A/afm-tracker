import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateDashboardMetrics,
  normalizePlatformToContentTypes,
  aggregateContentDistributionBreakdown,
  getContentMetricBasis,
  resolveDistributionReachBasis,
  getLatestDistributionEngagement,
} from "./aggregation.ts";

// Helper dummy product
const productA = {
  id: "prod-1",
  productName: "Serum Brightening",
  brand: "GlowLab",
  category: "Skincare",
  price: 100000,
  commissionRate: 10, // 10% -> Rp10,000
};

const productB = {
  id: "prod-2",
  productName: "Toner Hydrating",
  brand: "GlowLab",
  category: "Skincare",
  price: 80000,
  commissionRate: 5, // 5% -> Rp4,000
};

const platformFB = {
  id: "plat-fb",
  name: "Grup Racun Shopee 1.2M",
  platformType: "facebook",
};

const personaAI = {
  id: "pers-1",
  name: "Sarah Beauty AI",
};

// =========================================================================
// MANUAL SANITY TEST
// =========================================================================
test("MANUAL SANITY TEST - Exact canonical fixture verification", () => {
  // Input:
  // 1,000 reach, 50 likes, 10 comments, 5 shares, 5 saves, 40 affiliate clicks, 4 orders, Rp80,000 actual commission
  // Homogeneous views basis
  const fixtureContent = {
    id: "content-sanity",
    title: "Sanity Test Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [
      {
        viewsCount: 1000,
        likesCount: 50,
        commentsCount: 10,
        sharesCount: 5,
        savesCount: 5,
        clicksCount: 40,
        ordersCount: 4,
        actualCommission: 80000,
      },
    ],
  };

  const fixtureDist = {
    id: "dist-sanity",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [
      {
        viewsCount: 0,
        likesCount: 0,
        sharesCount: 0,
        clicksCount: 40,
        ordersCount: 4,
        actualCommission: 80000,
      },
    ],
  };

  const result = aggregateDashboardMetrics({
    contents: [fixtureContent],
    distributions: [fixtureDist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  // Verify Business Overview: No double counting (40 clicks & 4 orders, NOT 80 clicks / 8 orders)
  const bo = result.businessOverview;
  assert.equal(bo.totalReach, 1000);
  assert.equal(bo.totalEngagements, 70); // 50+10+5+5
  assert.equal(bo.affiliateClicks, 40, "Affiliate clicks must NOT be double counted to 80");
  assert.equal(bo.orders, 4, "Orders must NOT be double counted to 8");
  assert.equal(bo.commission, 80000, "Commission must NOT be double counted to 160000");
  assert.equal(bo.engagementRate, 7.0, "ER must be 7%");
  assert.equal(bo.affiliateCTR, 4.0, "CTR must be 4%");
  assert.equal(bo.conversionRate, 10.0, "CVR must be 10%");
  assert.equal(bo.epc, 2000, "EPC must be Rp2,000");

  // Verify Content Performance:
  const cp = result.contentPerformance[0];
  assert.equal(cp.views, 1000);
  assert.equal(cp.er, 7.0);
  assert.equal(cp.ctr, 4.0);
  assert.equal(cp.cvr, 10.0);
  assert.equal(cp.epc, 2000);
  assert.equal(cp.commission, 80000);
  assert.equal(cp.isActualCommission, true);

  // Verify Product Performance:
  const pp = result.productAnalytics[0];
  assert.equal(pp.id, productA.id);
  assert.equal(pp.totalClicks, 40);
  assert.equal(pp.totalOrders, 4);
  assert.equal(pp.totalCommission, 80000);
  assert.equal(pp.cvr, 10.0);
  assert.equal(pp.epc, 2000);

  // Verify Channel Performance:
  const ch = result.channelEfficiency[0];
  assert.equal(ch.id, platformFB.id);
  assert.equal(ch.totalClicks, 40);
  assert.equal(ch.totalOrders, 4);
  assert.equal(ch.totalCommission, 80000);
  assert.equal(ch.cvr, 10.0);
  assert.equal(ch.epc, 2000);
});

// =========================================================================
// CASE A: Single content, no distributions
// =========================================================================
test("CASE A - Single content, no distributions", () => {
  const contentOnly = {
    id: "c-1",
    title: "Organic TikTok Video",
    contentType: "tiktok",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [
      {
        viewsCount: 2000,
        likesCount: 100,
        commentsCount: 20,
        sharesCount: 10,
        savesCount: 10,
        clicksCount: 50,
        ordersCount: 5,
        actualCommission: 50000,
      },
    ],
  };

  const result = aggregateDashboardMetrics({
    contents: [contentOnly],
    distributions: [],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  // When distributions are 0, canonical source remains stable: DistributionEngagement (NO fallback)
  assert.equal(result.businessOverview.canonicalCommercialSource, "DistributionEngagement");
  assert.equal(result.businessOverview.hasDistributionData, false);
  assert.equal(result.businessOverview.dataNotice, "Belum ada data distribusi teratribusi.");
  assert.equal(result.businessOverview.affiliateClicks, 0, "No distribution data means 0 attributed clicks on Overview");
  assert.equal(result.businessOverview.orders, 0, "No distribution data means 0 attributed orders on Overview");
  assert.equal(result.businessOverview.commission, 0, "No distribution data means 0 attributed commission on Overview");
  assert.equal(result.businessOverview.affiliateCTR, null, "CTR is null when no distribution data exists");

  // Content-level commercial metrics remain 100% visible in Content Performance table:
  assert.equal(result.contentPerformance[0].clicks, 50);
  assert.equal(result.contentPerformance[0].orders, 5);
  assert.equal(result.contentPerformance[0].commission, 50000);
  assert.equal(result.contentPerformance[0].cvr, 10.0);
  assert.equal(result.contentPerformance[0].epc, 1000);

  // Option A: Separated Social Resonances
  assert.equal(result.businessOverview.contentEngagement.total, 140);
  assert.equal(result.businessOverview.contentEngagement.rate, 7.0); // 140 / 2000 views
  assert.equal(result.businessOverview.distributionEngagement.total, 0);
});

// =========================================================================
// CASE B: Single content + one distribution (Must NOT double count)
// =========================================================================
test("CASE B - Single content + one distribution with same metrics (Must NOT double count)", () => {
  const content = {
    id: "c-b",
    title: "Video Creative B",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [
      {
        viewsCount: 1000,
        likesCount: 20,
        commentsCount: 5,
        sharesCount: 2,
        savesCount: 1,
        clicksCount: 40,
        ordersCount: 4,
        actualCommission: 80000,
      },
    ],
  };

  const dist = {
    id: "dist-b",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [
      {
        viewsCount: 500,
        likesCount: 10,
        sharesCount: 2,
        clicksCount: 40,
        ordersCount: 4,
        actualCommission: 80000,
      },
    ],
  };

  const result = aggregateDashboardMetrics({
    contents: [content],
    distributions: [dist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  // DistributionEngagement is the canonical commercial throughput
  assert.equal(result.businessOverview.canonicalCommercialSource, "DistributionEngagement");
  assert.equal(result.businessOverview.affiliateClicks, 40, "Clicks must be 40, not 80");
  assert.equal(result.businessOverview.orders, 4, "Orders must be 4, not 8");
  assert.equal(result.businessOverview.commission, 80000, "Commission must be 80k, not 160k");
});

// =========================================================================
// CASE C: One content + multiple distributions
// =========================================================================
test("CASE C - One content + multiple distributions across channels", () => {
  const content = {
    id: "c-c",
    title: "Hero Creative Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 5000, likesCount: 200, commentsCount: 50, sharesCount: 20, clicksCount: 100, ordersCount: 10 }],
  };

  const dist1 = {
    id: "d-1",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 1000, likesCount: 10, sharesCount: 2, clicksCount: 30, ordersCount: 3, actualCommission: 30000 }],
  };

  const dist2 = {
    id: "d-2",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 800, likesCount: 5, sharesCount: 1, clicksCount: 20, ordersCount: 2, actualCommission: 20000 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [content],
    distributions: [dist1, dist2],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  // Canonical commercial sum comes from distributions (30 + 20 = 50 clicks; 3 + 2 = 5 orders; 50k commission)
  assert.equal(result.businessOverview.affiliateClicks, 50);
  assert.equal(result.businessOverview.orders, 5);
  assert.equal(result.businessOverview.commission, 50000);
});

// =========================================================================
// CASE D: One content/distribution + multiple products with unknown attribution
// =========================================================================
test("CASE D - Multi-product distribution must NOT multiply orders and goes to unallocated bucket", () => {
  const multiProductDist = {
    id: "dist-multi",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    // 2 products attached: Product A & Product B
    items: [{ product: productA }, { product: productB }],
    engagements: [
      {
        viewsCount: 2000,
        likesCount: 30,
        sharesCount: 5,
        clicksCount: 60,
        ordersCount: 6,
        actualCommission: 60000,
      },
    ],
  };

  const result = aggregateDashboardMetrics({
    contents: [],
    distributions: [multiProductDist],
    allProducts: [productA, productB],
    allPlatforms: [platformFB],
  });

  // Individual products must NOT be credited with phantom orders
  const prodA = result.productAnalytics.find((p) => p.id === productA.id);
  const prodB = result.productAnalytics.find((p) => p.id === productB.id);
  assert.equal(prodA, undefined, "Product A must not have single attribution");
  assert.equal(prodB, undefined, "Product B must not have single attribution");

  // An unallocated bucket must exist with exactly 6 orders and 60 clicks (NOT 12 orders / 120 clicks!)
  const unallocated = result.productAnalytics.find((p) => p.id === "unallocated-multi-product");
  assert.ok(unallocated, "Unallocated bucket must exist");
  assert.equal(unallocated.totalClicks, 60);
  assert.equal(unallocated.totalOrders, 6);
  assert.equal(unallocated.totalCommission, 60000);
});

// =========================================================================
// CASE E: actualCommission present
// =========================================================================
test("CASE E - actualCommission present is preferred directly", () => {
  const content = {
    id: "c-e",
    title: "Content with actual commission",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 10, commentsCount: 0, sharesCount: 0, clicksCount: 20, ordersCount: 2, actualCommission: 45000 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [content],
    distributions: [],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(result.contentPerformance[0].commission, 45000);
  assert.equal(result.contentPerformance[0].isActualCommission, true);
});

// =========================================================================
// CASE F: actualCommission missing
// =========================================================================
test("CASE F - actualCommission missing: single product estimates, multi-product returns null (N/A)", () => {
  // Single product content: estimates price * rate = 100,000 * 10% = 10,000 * 2 orders = 20,000
  const singleProdContent = {
    id: "c-f1",
    title: "Single Product without actual",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 10, commentsCount: 0, sharesCount: 0, clicksCount: 20, ordersCount: 2, actualCommission: null }],
  };

  // Multi-product content without actual: must return null (N/A) rather than blind average
  const multiProdContent = {
    id: "c-f2",
    title: "Multi Product without actual",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }, { product: productB }],
    metrics: [{ viewsCount: 1000, likesCount: 10, commentsCount: 0, sharesCount: 0, clicksCount: 20, ordersCount: 2, actualCommission: null }],
  };

  const result = aggregateDashboardMetrics({
    contents: [singleProdContent, multiProdContent],
    distributions: [],
    allProducts: [productA, productB],
    allPlatforms: [platformFB],
  });

  const cpSingle = result.contentPerformance.find((c) => c.id === "c-f1");
  assert.equal(cpSingle.commission, 20000);
  assert.equal(cpSingle.isActualCommission, false);

  const cpMulti = result.contentPerformance.find((c) => c.id === "c-f2");
  assert.equal(cpMulti.commission, null, "Multi-product without actualCommission must be null (N/A)");
  assert.equal(cpMulti.isActualCommission, false);
});

// =========================================================================
// CASE G & H & I: Views basis, Impressions basis, Mixed basis
// =========================================================================
test("CASE G & H - Homogeneous Views or Impressions basis calculates exact CTR and ER", () => {
  // Case G: Homogeneous views
  const viewContent = {
    id: "c-g",
    title: "Video Only",
    contentType: "tiktok",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 40, commentsCount: 0, sharesCount: 0, clicksCount: 20, ordersCount: 1 }],
  };

  const resG = aggregateDashboardMetrics({
    contents: [viewContent],
    distributions: [],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(resG.businessOverview.reachBasis, "views");
  assert.equal(resG.businessOverview.hasDistributionData, false);
  assert.equal(resG.businessOverview.affiliateCTR, null, "CTR is null when no distribution data exists");
  assert.equal(resG.businessOverview.contentEngagement.rate, 4.0);
  assert.equal(resG.contentPerformance[0].ctr, 2.0);
  assert.equal(resG.contentPerformance[0].er, 4.0);

  // Case H: Homogeneous impressions
  const impDist = {
    id: "d-h",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 2000, likesCount: 60, sharesCount: 0, clicksCount: 40, ordersCount: 2 }],
  };

  const resH = aggregateDashboardMetrics({
    contents: [],
    distributions: [impDist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(resH.businessOverview.reachBasis, "impressions");
  assert.equal(resH.businessOverview.affiliateCTR, 2.0);
  assert.equal(resH.businessOverview.engagementRate, 3.0);
});

test("CASE I - Mixed basis: CTR and ER must be null (N/A) to prevent invalid universal ratio", () => {
  const viewContent = {
    id: "c-i",
    title: "Video Content",
    contentType: "tiktok",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 40, commentsCount: 0, sharesCount: 0, clicksCount: 20, ordersCount: 1 }],
  };

  const impDist = {
    id: "d-i",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 1000, likesCount: 30, sharesCount: 0, clicksCount: 20, ordersCount: 1 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [viewContent],
    distributions: [impDist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(result.businessOverview.reachBasis, "mixed");
  assert.equal(result.businessOverview.totalReach, 2000);
  // CTR and ER MUST be null!
  assert.equal(result.businessOverview.affiliateCTR, null, "Aggregate CTR must be null on Mixed Basis");
  assert.equal(result.businessOverview.engagementRate, null, "Aggregate ER must be null on Mixed Basis");
});

// =========================================================================
// CASE J: zero clicks / zero orders
// =========================================================================
test("CASE J - Zero clicks and zero orders safety", () => {
  const zeroContent = {
    id: "c-j",
    title: "Brand New Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 100, likesCount: 2, commentsCount: 0, sharesCount: 0, clicksCount: 0, ordersCount: 0, actualCommission: 0 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [zeroContent],
    distributions: [],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(result.businessOverview.affiliateClicks, 0);
  assert.equal(result.businessOverview.orders, 0);
  assert.equal(result.businessOverview.conversionRate, 0);
  assert.equal(result.businessOverview.epc, 0);
});

// =========================================================================
// PLATFORM NORMALIZATION TEST
// =========================================================================
test("normalizePlatformToContentTypes - maps parent platform correctly", () => {
  assert.deepEqual(normalizePlatformToContentTypes("facebook"), ["fb_reels", "facebook"]);
  assert.deepEqual(normalizePlatformToContentTypes("instagram"), ["ig_reels", "instagram"]);
  assert.deepEqual(normalizePlatformToContentTypes("shopee"), ["shopee_video", "shopee"]);
  assert.deepEqual(normalizePlatformToContentTypes("tiktok"), ["tiktok"]);
});

// =========================================================================
// OPTION A: SEPARATED SOCIAL ENGAGEMENT (NO BLIND SUMMING)
// =========================================================================
test("OPTION A - Separated Social Engagement without blind summing", () => {
  const content = {
    id: "c-social",
    title: "Video with Organic Engagement",
    contentType: "tiktok",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 40, commentsCount: 10, sharesCount: 5, savesCount: 5 }],
  };

  const dist = {
    id: "d-social",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 500, likesCount: 15, sharesCount: 5, clicksCount: 10, ordersCount: 1 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [content],
    distributions: [dist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  const bo = result.businessOverview;
  // Content engagement is strictly 40+10+5+5 = 60
  assert.equal(bo.contentEngagement.total, 60);
  assert.equal(bo.contentEngagement.likes, 40);
  assert.equal(bo.contentEngagement.comments, 10);
  assert.equal(bo.contentEngagement.shares, 5);
  assert.equal(bo.contentEngagement.saves, 5);
  assert.equal(bo.contentEngagement.rate, 6.0); // 60 / 1000 views
  assert.equal(bo.contentEngagement.basis, "views");

  // Distribution engagement is strictly 15+5 = 20
  assert.equal(bo.distributionEngagement.total, 20);
  assert.equal(bo.distributionEngagement.likes, 15);
  assert.equal(bo.distributionEngagement.shares, 5);
  assert.equal(bo.distributionEngagement.rate, 4.0); // 20 / 500 impressions
  assert.equal(bo.distributionEngagement.basis, "impressions");

  // They are NOT merged into an unjustified blind sum
  assert.notEqual(bo.contentEngagement.total, bo.contentEngagement.total + bo.distributionEngagement.total);
});

// =========================================================================
// STABLE CANONICAL SOURCE: ZERO DISTRIBUTION DATA STATE
// =========================================================================
test("STABLE CANONICAL SOURCE - Zero distributions shows 0 / N/A with notice", () => {
  const content = {
    id: "c-nodist",
    title: "Content with organic clicks but zero distributions",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 10, commentsCount: 0, sharesCount: 0, clicksCount: 88, ordersCount: 8, actualCommission: 100000 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [content],
    distributions: [],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  const bo = result.businessOverview;
  assert.equal(bo.canonicalCommercialSource, "DistributionEngagement");
  assert.equal(bo.hasDistributionData, false);
  assert.equal(bo.dataNotice, "Belum ada data distribusi teratribusi.");
  assert.equal(bo.affiliateClicks, 0);
  assert.equal(bo.orders, 0);
  assert.equal(bo.commission, 0);
  assert.equal(bo.affiliateCTR, null);
  assert.equal(bo.conversionRate, 0);
  assert.equal(bo.epc, 0);

  // But content performance table still displays content metrics
  assert.equal(result.contentPerformance[0].clicks, 88);
  assert.equal(result.contentPerformance[0].orders, 8);
  assert.equal(result.contentPerformance[0].commission, 100000);
});

// =========================================================================
// PHASE 2 DETERMINISTIC TEST CASES (CASE 1 - CASE 14)
// =========================================================================

test("CASE 1 - One Content linked to one Distribution", () => {
  const content = {
    id: "content-c1",
    title: "Review Serum Glowing",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 2000, likesCount: 100, commentsCount: 10, sharesCount: 5, clicksCount: 50, ordersCount: 5, actualCommission: 50000 }],
  };

  const dist = {
    id: "dist-c1",
    contentId: "content-c1",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 1000, likesCount: 50, sharesCount: 10, clicksCount: 60, ordersCount: 6, actualCommission: 60000 }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [dist],
    allProducts: [productA],
  });

  assert.equal(summary.contentId, "content-c1");
  assert.equal(summary.totalDistributions, 1);
  assert.equal(summary.totalReach, 1000);
  assert.equal(summary.totalClicks, 60);
  assert.equal(summary.totalOrders, 6);
  assert.equal(summary.totalCommission, 60000);
  assert.equal(summary.commissionProvenance, "ACTUAL");
  assert.equal(summary.overallCtr, 6.0); // 60/1000 * 100
  assert.equal(summary.overallCvr, 10.0); // 6/60 * 100
  assert.equal(summary.overallEpc, 1000); // 60000/60
  assert.equal(summary.breakdown.length, 1);
  assert.equal(summary.breakdown[0].distributionId, "dist-c1");
  assert.equal(summary.breakdown[0].commissionProvenance, "ACTUAL");
});

test("CASE 2 - One Content linked to multiple Distributions", () => {
  const content = {
    id: "content-c2",
    title: "Tips Skincare Pagi",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 3000, likesCount: 150, commentsCount: 20, sharesCount: 10, clicksCount: 100, ordersCount: 10, actualCommission: 100000 }],
  };

  const dist1 = {
    id: "dist-c2-1",
    contentId: "content-c2",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 1000, likesCount: 40, sharesCount: 5, clicksCount: 50, ordersCount: 5, actualCommission: 50000 }],
  };

  const platformTele = { id: "plat-tele", name: "Telegram Promo", platformType: "telegram" };
  const dist2 = {
    id: "dist-c2-2",
    contentId: "content-c2",
    platformId: platformTele.id,
    platform: platformTele,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 500, likesCount: 20, sharesCount: 2, clicksCount: 30, ordersCount: 3, actualCommission: 30000 }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [dist1, dist2],
    allProducts: [productA],
  });

  assert.equal(summary.totalDistributions, 2);
  assert.equal(summary.totalReach, 1500);
  assert.equal(summary.totalClicks, 80);
  assert.equal(summary.totalOrders, 8);
  assert.equal(summary.totalCommission, 80000);
  assert.equal(summary.commissionProvenance, "ACTUAL");
  assert.equal(summary.overallCvr, 10.0);
  assert.equal(summary.overallEpc, 1000);
});

test("CASE 3 - Multiple Contents distributed to the same Channel", () => {
  const contentA = {
    id: "content-c3a",
    title: "Video A",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 500, likesCount: 10, commentsCount: 2, sharesCount: 1 }],
  };

  const contentB = {
    id: "content-c3b",
    title: "Video B",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productB }],
    metrics: [{ viewsCount: 600, likesCount: 20, commentsCount: 5, sharesCount: 2 }],
  };

  const distForA = {
    id: "dist-for-a",
    contentId: "content-c3a",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "comment",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 200, likesCount: 10, sharesCount: 1, clicksCount: 15, ordersCount: 1, actualCommission: 10000 }],
  };

  const distForB = {
    id: "dist-for-b",
    contentId: "content-c3b",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productB }],
    engagements: [{ viewsCount: 400, likesCount: 20, sharesCount: 2, clicksCount: 25, ordersCount: 2, actualCommission: 8000 }],
  };

  const summaryA = aggregateContentDistributionBreakdown({
    content: contentA,
    distributions: [distForA, distForB],
    allProducts: [productA, productB],
  });

  const summaryB = aggregateContentDistributionBreakdown({
    content: contentB,
    distributions: [distForA, distForB],
    allProducts: [productA, productB],
  });

  assert.equal(summaryA.totalDistributions, 1);
  assert.equal(summaryA.breakdown[0].distributionId, "dist-for-a");
  assert.equal(summaryA.totalClicks, 15);

  assert.equal(summaryB.totalDistributions, 1);
  assert.equal(summaryB.breakdown[0].distributionId, "dist-for-b");
  assert.equal(summaryB.totalClicks, 25);
});

test("CASE 4 - Distribution with contentId = null (unlinked distribution)", () => {
  const content = {
    id: "content-c4",
    title: "Video Content",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 20, commentsCount: 2, sharesCount: 1 }],
  };

  const unlinkedDist = {
    id: "dist-unlinked",
    contentId: null,
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "comment",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 300, likesCount: 5, sharesCount: 0, clicksCount: 12, ordersCount: 1, actualCommission: 10000 }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [unlinkedDist],
    allProducts: [productA],
  });

  assert.equal(summary.totalDistributions, 0);
  assert.equal(summary.totalReach, 0);
  assert.equal(summary.totalClicks, 0);
  assert.equal(summary.breakdown.length, 0);
  assert.equal(summary.commissionProvenance, "UNAVAILABLE");
});

test("CASE 5 - Deleting or unlinking Content preserves Distribution intact in dashboard aggregation", () => {
  const unlinkedDist = {
    id: "dist-c5",
    contentId: null, // content deleted/unlinked
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 800, likesCount: 30, sharesCount: 4, clicksCount: 40, ordersCount: 4, actualCommission: 40000 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [],
    distributions: [unlinkedDist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  const bo = result.businessOverview;
  assert.equal(bo.affiliateClicks, 40, "Commercial clicks intact even without linked content");
  assert.equal(bo.orders, 4, "Orders intact");
  assert.equal(bo.commission, 40000, "Commission intact");
});

test("CASE 6 - Global filters with linked Content", () => {
  const content = {
    id: "content-c6",
    title: "Video Content",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1000, likesCount: 20, commentsCount: 2, sharesCount: 1 }],
  };

  const dist = {
    id: "dist-c6",
    contentId: "content-c6",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 500, likesCount: 10, sharesCount: 2, clicksCount: 20, ordersCount: 2, actualCommission: 20000 }],
  };

  const filteredContents = [content].filter(c => c.persona.id === personaAI.id);
  const filteredDistributions = [dist].filter(d => d.persona.id === personaAI.id);

  const result = aggregateDashboardMetrics({
    contents: filteredContents,
    distributions: filteredDistributions,
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(result.businessOverview.affiliateClicks, 20);
  assert.equal(result.businessOverview.orders, 2);
});

test("CASE 7 - Content Detail shows only its linked Distributions", () => {
  const contentTarget = {
    id: "c7-target",
    title: "Target Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [],
  };

  const contentOther = {
    id: "c7-other",
    title: "Other Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productB }],
    metrics: [],
  };

  const distTarget = {
    id: "dist-target",
    contentId: "c7-target",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 100, likesCount: 5, sharesCount: 1, clicksCount: 10, ordersCount: 1, actualCommission: 10000 }],
  };

  const distOther = {
    id: "dist-other",
    contentId: "c7-other",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productB }],
    engagements: [{ viewsCount: 200, likesCount: 10, sharesCount: 2, clicksCount: 20, ordersCount: 2, actualCommission: 20000 }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content: contentTarget,
    distributions: [distTarget, distOther],
    allProducts: [productA, productB],
  });

  assert.equal(summary.totalDistributions, 1);
  assert.equal(summary.breakdown[0].distributionId, "dist-target");
  assert.equal(summary.totalClicks, 10);

  const summaryOther = aggregateContentDistributionBreakdown({
    content: contentOther,
    distributions: [distTarget, distOther],
    allProducts: [productA, productB],
  });
  assert.equal(summaryOther.totalDistributions, 1);
  assert.equal(summaryOther.breakdown[0].distributionId, "dist-other");
  assert.equal(summaryOther.totalClicks, 20);
});

test("CASE 8 - Same Content across multiple Channels with different metrics", () => {
  const content = {
    id: "c8-content",
    title: "Multi-channel Content",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [],
  };

  const distFB = {
    id: "c8-dist-fb",
    contentId: "c8-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 1000, likesCount: 50, sharesCount: 10, clicksCount: 40, ordersCount: 2, actualCommission: 20000 }],
  };

  const platformWA = { id: "plat-wa", name: "WhatsApp Group", platformType: "whatsapp" };
  const distWA = {
    id: "c8-dist-wa",
    contentId: "c8-content",
    platformId: platformWA.id,
    platform: platformWA,
    persona: personaAI,
    distributionType: "comment",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 200, likesCount: 10, sharesCount: 0, clicksCount: 20, ordersCount: 3, actualCommission: 30000 }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [distFB, distWA],
    allProducts: [productA],
  });

  assert.equal(summary.totalDistributions, 2);
  assert.equal(summary.totalClicks, 60);
  assert.equal(summary.totalOrders, 5);
  assert.equal(summary.totalCommission, 50000);

  // Dist FB has 40 clicks / 1000 reach = 4% CTR, 2/40 = 5% CVR
  const rowFB = summary.breakdown.find(b => b.distributionId === "c8-dist-fb");
  assert.equal(rowFB.ctr, 4.0);
  assert.equal(rowFB.cvr, 5.0);

  // Dist WA has 20 clicks / 200 reach = 10% CTR, 3/20 = 15% CVR
  const rowWA = summary.breakdown.find(b => b.distributionId === "c8-dist-wa");
  assert.equal(rowWA.ctr, 10.0);
  assert.equal(rowWA.cvr, 15.0);
});

test("CASE 9 - Multi-product Distribution without actual commission yields UNAVAILABLE provenance", () => {
  const content = {
    id: "c9-content",
    title: "Multi-product Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }, { product: productB }],
    metrics: [],
  };

  const distMulti = {
    id: "c9-dist-multi",
    contentId: "c9-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }, { product: productB }],
    engagements: [{ viewsCount: 1000, likesCount: 10, sharesCount: 1, clicksCount: 50, ordersCount: 5, actualCommission: null }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [distMulti],
    allProducts: [productA, productB],
  });

  assert.equal(summary.breakdown[0].commission, null);
  assert.equal(summary.breakdown[0].commissionProvenance, "UNAVAILABLE");
  assert.equal(summary.totalCommission, null);
  assert.equal(summary.commissionProvenance, "UNAVAILABLE");
});

test("CASE 10 - No regression in Phase 1 canonical commercial aggregation", () => {
  const content = {
    id: "c10-content",
    title: "Shopee Video Top",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 5000, likesCount: 200, commentsCount: 50, sharesCount: 20, clicksCount: 100, ordersCount: 10, actualCommission: 100000 }],
  };

  const dist = {
    id: "c10-dist",
    contentId: "c10-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 2000, likesCount: 80, sharesCount: 15, clicksCount: 120, ordersCount: 12, actualCommission: 120000 }],
  };

  const result = aggregateDashboardMetrics({
    contents: [content],
    distributions: [dist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  const bo = result.businessOverview;
  assert.equal(bo.canonicalCommercialSource, "DistributionEngagement");
  assert.equal(bo.affiliateClicks, 120, "Distribution clicks is canonical");
  assert.equal(bo.orders, 12, "Distribution orders is canonical");
  assert.equal(bo.commission, 120000, "Distribution commission is canonical");
  assert.notEqual(bo.affiliateClicks, 220, "Must not sum content + distribution clicks");
});

test("CASE 11 - Content with impressions basis preserves impressions reachBasis (does NOT assume video views)", () => {
  const contentThreads = {
    id: "c11-threads",
    title: "Utas Skincare Viral",
    contentType: "threads",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 1500, likesCount: 60, commentsCount: 15, sharesCount: 5 }],
  };

  assert.equal(getContentMetricBasis(contentThreads.contentType), "impressions");

  const distThreads = {
    id: "c11-dist",
    contentId: "c11-threads",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 800, likesCount: 30, sharesCount: 3, clicksCount: 40, ordersCount: 4, actualCommission: 40000 }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content: contentThreads,
    distributions: [distThreads],
    allProducts: [productA],
  });

  assert.equal(summary.reachBasis, "impressions", "Must preserve impressions basis");
  assert.equal(summary.breakdown[0].reachBasis, "impressions");
  assert.equal(resolveDistributionReachBasis(distThreads, contentThreads), "impressions");
  assert.equal(summary.overallCtr, 5.0); // 40/800 * 100
});

test("CASE 12 - Commission aggregation with actual + estimated yields MIXED provenance", () => {
  const content = {
    id: "c12-content",
    title: "Creative Skincare",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [],
  };

  // Dist 1: Actual commission
  const dist1 = {
    id: "c12-dist-1",
    contentId: "c12-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 500, likesCount: 20, sharesCount: 2, clicksCount: 25, ordersCount: 2, actualCommission: 50000 }],
  };

  // Dist 2: Single-product estimated commission (3 orders * Rp100,000 * 10% = Rp30,000)
  const dist2 = {
    id: "c12-dist-2",
    contentId: "c12-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 500, likesCount: 15, sharesCount: 1, clicksCount: 30, ordersCount: 3, actualCommission: null }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [dist1, dist2],
    allProducts: [productA],
  });

  assert.equal(summary.breakdown[0].commissionProvenance, "ACTUAL");
  assert.equal(summary.breakdown[1].commissionProvenance, "ESTIMATED");
  assert.equal(summary.breakdown[1].commission, 30000);
  assert.equal(summary.totalCommission, 80000); // 50,000 + 30,000
  assert.equal(summary.commissionProvenance, "MIXED", "Summary of actual + estimated must be MIXED");
});

test("CASE 13 - Commission aggregation containing unavailable multi-product yields PARTIAL provenance", () => {
  const content = {
    id: "c13-content",
    title: "Creative Skincare Bundle",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }, { product: productB }],
    metrics: [],
  };

  // Dist 1: Actual commission
  const dist1 = {
    id: "c13-dist-1",
    contentId: "c13-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [{ viewsCount: 500, likesCount: 20, sharesCount: 2, clicksCount: 25, ordersCount: 2, actualCommission: 50000 }],
  };

  // Dist 2: Multi-product with 2 orders, no actual commission -> UNAVAILABLE
  const dist2 = {
    id: "c13-dist-2",
    contentId: "c13-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }, { product: productB }],
    engagements: [{ viewsCount: 500, likesCount: 15, sharesCount: 1, clicksCount: 30, ordersCount: 2, actualCommission: null }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [dist1, dist2],
    allProducts: [productA, productB],
  });

  assert.equal(summary.breakdown[0].commissionProvenance, "ACTUAL");
  assert.equal(summary.breakdown[1].commissionProvenance, "UNAVAILABLE");
  assert.equal(summary.totalCommission, 50000);
  assert.equal(summary.commissionProvenance, "PARTIAL", "Known commission with unallocated orders must be PARTIAL");
});

test("CASE 14 - Content with multiple ContentProducts must not force multi-product distribution without explicit selection", () => {
  // Content has multiple products (Product A and Product B)
  const content = {
    id: "c14-content",
    title: "Skincare Duo Comparison",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }, { product: productB }],
    metrics: [],
  };

  // User explicitly distributed only Product A
  const distSingleProd = {
    id: "c14-dist",
    contentId: "c14-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }], // Exactly 1 product selected
    engagements: [{ viewsCount: 1000, likesCount: 30, sharesCount: 5, clicksCount: 50, ordersCount: 4, actualCommission: null }],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [distSingleProd],
    allProducts: [productA, productB],
  });

  // Estimated commission is preserved for single product: 4 * 100,000 * 10% = 40,000
  assert.equal(summary.breakdown[0].commissionProvenance, "ESTIMATED");
  assert.equal(summary.breakdown[0].commission, 40000);
  assert.equal(summary.totalCommission, 40000);
  assert.equal(summary.commissionProvenance, "ESTIMATED");
});

test("CASE 15 — Same Content linked to distributions with mixed reach bases", () => {
  // Content is a Shopee Video creative
  const content = {
    id: "c15-content",
    title: "Viral Skincare Video",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 20000, likesCount: 800, commentsCount: 50, sharesCount: 30 }],
  };

  // Distribution A: Facebook Group post (impressions placement)
  // 10,000 impressions, 400 clicks, 20 orders, Rp200,000 commission
  const distA = {
    id: "dist-c15-a",
    contentId: "c15-content",
    platformId: platformFB.id,
    platform: platformFB, // "Grup Racun Shopee 1.2M", platformType: "facebook"
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [
      {
        viewsCount: 10000,
        likesCount: 120,
        sharesCount: 15,
        clicksCount: 400,
        ordersCount: 20,
        actualCommission: 200000,
      },
    ],
  };

  // Distribution B: TikTok video placement (views/plays placement)
  // 5,000 plays, 300 clicks, 15 orders, Rp150,000 commission
  const platformTikTok = {
    id: "plat-tt",
    name: "Akun TikTok Official",
    platformType: "tiktok",
  };

  const distB = {
    id: "dist-c15-b",
    contentId: "c15-content",
    platformId: platformTikTok.id,
    platform: platformTikTok,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [
      {
        viewsCount: 5000,
        likesCount: 300,
        sharesCount: 50,
        clicksCount: 300,
        ordersCount: 15,
        actualCommission: 150000,
      },
    ],
  };

  // Verify independent placement reach basis resolution
  assert.equal(getContentMetricBasis(content.contentType), "views", "Content creative is video");
  assert.equal(resolveDistributionReachBasis(distA, content), "impressions", "FB Group placement is impressions");
  assert.equal(resolveDistributionReachBasis(distB, content), "views", "TikTok placement is views");

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [distA, distB],
    allProducts: [productA],
  });

  // Verify individual breakdown items preserve local placement basis and local CTR
  assert.equal(summary.breakdown.length, 2);
  assert.equal(summary.breakdown[0].distributionId, "dist-c15-a");
  assert.equal(summary.breakdown[0].reachBasis, "impressions");
  assert.equal(summary.breakdown[0].reach, 10000);
  assert.equal(summary.breakdown[0].clicks, 400);
  assert.equal(summary.breakdown[0].ctr, 4.0, "Distribution A CTR must be 400/10000 = 4.0%");

  assert.equal(summary.breakdown[1].distributionId, "dist-c15-b");
  assert.equal(summary.breakdown[1].reachBasis, "views");
  assert.equal(summary.breakdown[1].reach, 5000);
  assert.equal(summary.breakdown[1].clicks, 300);
  assert.equal(summary.breakdown[1].ctr, 6.0, "Distribution B CTR must be 300/5000 = 6.0%");

  // Verify aggregate properties
  // Total Clicks: 700 (400 + 300)
  assert.equal(summary.totalClicks, 700, "Clicks must be additive");
  // Total Orders: 35 (20 + 15)
  assert.equal(summary.totalOrders, 35, "Orders must be additive");
  // Total Commission: 350,000 (200,000 + 150,000)
  assert.equal(summary.totalCommission, 350000, "Commission must be additive");
  assert.equal(summary.commissionProvenance, "ACTUAL");

  // Informational total reach
  assert.equal(summary.totalReach, 15000);

  // Mixed basis safeguard:
  assert.equal(summary.reachBasis, "mixed", "Mixed reach bases must result in mixed reachBasis");
  assert.equal(
    summary.overallCtr,
    null,
    "Aggregate CTR must be null (N/A) on Mixed Basis to prevent invalid 700/15000 ratio"
  );

  // Conversion rate and EPC remain valid
  assert.equal(summary.overallCvr, 5.0, "Overall CVR is 35/700 * 100 = 5.0%");
  assert.equal(summary.overallEpc, 500, "Overall EPC is 350000/700 = 500");
});

test("CASE 16 — Distribution with multiple cumulative metric snapshots (Only latest snapshot used)", () => {
  const content = {
    id: "c16-content",
    title: "Review Skincare Viral",
    contentType: "shopee_video",
    publishedAt: new Date("2026-03-01T08:00:00Z"),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [{ viewsCount: 10000, likesCount: 400, commentsCount: 20, sharesCount: 10 }],
  };

  // Distribution with 2 historical snapshots:
  // Snapshot A: 2026-03-01T10:00:00Z -> reach: 1,000, clicks: 20, orders: 2, commission: 20,000
  // Snapshot B: 2026-03-02T10:00:00Z -> reach: 1,500, clicks: 30, orders: 3, commission: 30,000
  const dist = {
    id: "dist-c16",
    contentId: "c16-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date("2026-03-01T09:00:00Z"),
    status: "posted",
    items: [{ product: productA }],
    engagements: [
      {
        id: "eng-snap-a",
        capturedAt: new Date("2026-03-01T10:00:00Z"),
        viewsCount: 1000,
        likesCount: 20,
        sharesCount: 5,
        clicksCount: 20,
        ordersCount: 2,
        actualCommission: 20000,
      },
      {
        id: "eng-snap-b",
        capturedAt: new Date("2026-03-02T10:00:00Z"), // Latest
        viewsCount: 1500,
        likesCount: 35,
        sharesCount: 8,
        clicksCount: 30,
        ordersCount: 3,
        actualCommission: 30000,
      },
    ],
  };

  // Helper check
  const latest = getLatestDistributionEngagement(dist.engagements);
  assert.equal(latest.id, "eng-snap-b");
  assert.equal(latest.viewsCount, 1500);

  // Drilldown breakdown check
  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [dist],
    allProducts: [productA],
  });

  assert.equal(summary.totalReach, 1500, "Reach must NOT sum snapshots (1500, not 2500)");
  assert.equal(summary.totalClicks, 30, "Clicks must NOT sum snapshots (30, not 50)");
  assert.equal(summary.totalOrders, 3, "Orders must NOT sum snapshots (3, not 5)");
  assert.equal(summary.totalCommission, 30000, "Commission must NOT sum snapshots (30,000, not 50,000)");
  assert.equal(summary.overallEpc, 1000, "EPC is 30,000 / 30 = 1000");

  assert.equal(summary.breakdown[0].reach, 1500);
  assert.equal(summary.breakdown[0].clicks, 30);
  assert.equal(summary.breakdown[0].orders, 3);
  assert.equal(summary.breakdown[0].commission, 30000);
  assert.equal(summary.breakdown[0].epc, 1000);

  // Top-level Dashboard Aggregation check
  const dashboard = aggregateDashboardMetrics({
    contents: [content],
    distributions: [dist],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  assert.equal(dashboard.businessOverview.affiliateClicks, 30, "Dashboard clicks use latest snapshot");
  assert.equal(dashboard.businessOverview.orders, 3, "Dashboard orders use latest snapshot");
  assert.equal(dashboard.businessOverview.commission, 30000, "Dashboard commission uses latest snapshot");
  assert.equal(dashboard.businessOverview.epc, 1000);
});

test("CASE 17 — Partial commission must suppress aggregate EPC", () => {
  const content = {
    id: "c17-content",
    title: "Multi-Product Content Campaign",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }, { product: productB }],
    metrics: [{ viewsCount: 15000, likesCount: 600, commentsCount: 40, sharesCount: 20 }],
  };

  // Distribution A: Known actual commission (100 clicks, 5 orders, Rp100,000 commission)
  const distA = {
    id: "dist-c17-a",
    contentId: "c17-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }],
    engagements: [
      {
        viewsCount: 5000,
        clicksCount: 100,
        ordersCount: 5,
        actualCommission: 100000,
        capturedAt: new Date(),
      },
    ],
  };

  // Distribution B: Multi-product distribution with orders > 0 but NO actualCommission
  // (Cannot estimate because multi-product -> UNAVAILABLE)
  const distB = {
    id: "dist-c17-b",
    contentId: "c17-content",
    platformId: platformFB.id,
    platform: platformFB,
    persona: personaAI,
    distributionType: "post",
    postedAt: new Date(),
    status: "posted",
    items: [{ product: productA }, { product: productB }], // Multi-product
    engagements: [
      {
        viewsCount: 5000,
        clicksCount: 100,
        ordersCount: 5,
        actualCommission: null, // Unknown!
        capturedAt: new Date(),
      },
    ],
  };

  const summary = aggregateContentDistributionBreakdown({
    content,
    distributions: [distA, distB],
    allProducts: [productA, productB],
  });

  assert.equal(summary.breakdown[0].commissionProvenance, "ACTUAL");
  assert.equal(summary.breakdown[0].commission, 100000);
  assert.equal(summary.breakdown[0].epc, 1000);

  assert.equal(summary.breakdown[1].commissionProvenance, "UNAVAILABLE");
  assert.equal(summary.breakdown[1].commission, null);
  assert.equal(summary.breakdown[1].epc, null);

  // Overall Provenance is PARTIAL because some distributions are known and some are unavailable
  assert.equal(summary.commissionProvenance, "PARTIAL");
  // Total Commission is partial sum (100,000)
  assert.equal(summary.totalCommission, 100000);
  // Total Clicks is 200 (100 + 100)
  assert.equal(summary.totalClicks, 200);

  // Aggregate EPC must be SUPPRESSED (null / N/A) because click denominator includes unknown commission placements!
  assert.equal(
    summary.overallEpc,
    null,
    "Aggregate EPC must be null (N/A) when commission provenance is PARTIAL"
  );
});

test("Mixed ContentMetric basis on dashboard sets contentEngagement.basis = mixed and rate = null", () => {
  // Shopee Video: views-based format (1,000 plays, 100 engagements)
  const videoContent = {
    id: "c-video",
    title: "Shopee Video Product Demo",
    contentType: "shopee_video",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [
      {
        viewsCount: 1000,
        likesCount: 70,
        commentsCount: 20,
        sharesCount: 10,
        savesCount: 0,
        clicksCount: 50,
      },
    ],
  };

  // Threads: impressions-based format (3,000 impressions, 150 engagements)
  const threadsContent = {
    id: "c-threads",
    title: "Threads Recommendation Post",
    contentType: "threads",
    publishedAt: new Date(),
    persona: personaAI,
    products: [{ product: productA }],
    metrics: [
      {
        viewsCount: 3000,
        likesCount: 100,
        commentsCount: 30,
        sharesCount: 20,
        savesCount: 0,
        clicksCount: 60,
      },
    ],
  };

  // Verify per-content basis resolution
  assert.equal(getContentMetricBasis(videoContent.contentType), "views");
  assert.equal(getContentMetricBasis(threadsContent.contentType), "impressions");

  const dashboard = aggregateDashboardMetrics({
    contents: [videoContent, threadsContent],
    distributions: [],
    allProducts: [productA],
    allPlatforms: [platformFB],
  });

  // Per-content ER must remain valid:
  // Video ER: (70+20+10) / 1000 = 10.0%
  assert.equal(dashboard.contentPerformance[0].er, 10.0);
  assert.equal(dashboard.contentPerformance[0].metricBasis, "views");

  // Threads ER: (100+30+20) / 3000 = 5.0%
  assert.equal(dashboard.contentPerformance[1].er, 5.0);
  assert.equal(dashboard.contentPerformance[1].metricBasis, "impressions");

  // Aggregate Content Engagement must be marked "mixed" and aggregate rate suppressed (null / N/A)
  // to avoid invalid blending of 4,000 heterogeneous reach!
  assert.equal(
    dashboard.businessOverview.contentEngagement.basis,
    "mixed",
    "Content engagement basis must be mixed when views and impressions content co-exist"
  );
  assert.equal(
    dashboard.businessOverview.contentEngagement.rate,
    null,
    "Aggregate Content ER must be null (N/A) on mixed content basis"
  );
  assert.equal(
    dashboard.businessOverview.engagementRate,
    null,
    "Top-level engagement rate must also be null on mixed content basis"
  );
});


