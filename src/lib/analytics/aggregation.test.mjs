import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateDashboardMetrics,
  normalizePlatformToContentTypes,
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

  // When distributions are 0, commercial fallback is ContentMetric
  assert.equal(result.businessOverview.canonicalCommercialSource, "ContentMetric");
  assert.equal(result.businessOverview.affiliateClicks, 50);
  assert.equal(result.businessOverview.orders, 5);
  assert.equal(result.businessOverview.commission, 50000);
  assert.equal(result.businessOverview.conversionRate, 10.0);
  assert.equal(result.businessOverview.epc, 1000);
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
  assert.equal(resG.businessOverview.affiliateCTR, 2.0);
  assert.equal(resG.businessOverview.engagementRate, 4.0);

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
