"use server";

import { prisma } from "@/lib/prisma";

export interface CampaignSummary {
  name: string;
  productCount: number;
  distributionCount: number;
  contentCount: number;
  totalViews: number;
  totalClicks: number;
  totalOrders: number;
  estimatedEarnings: number;
  products: {
    id: string;
    productName: string;
    brand: string;
    price: number;
    commissionRate: number;
  }[];
  distributions: {
    id: string;
    platformName: string;
    platformType: string;
    personaName: string;
    postedAt: Date;
    status: string;
    postUrl: string;
    views: number;
    clicks: number;
    orders: number;
  }[];
  contents: {
    id: string;
    title: string;
    contentType: string;
    personaName: string;
    publishedAt: Date;
    platformUrl: string;
    views: number;
    clicks: number;
  }[];
}

export async function getCampaignAnalytics(): Promise<{
  success: boolean;
  data: CampaignSummary[];
  error?: string;
}> {
  try {
    const [products, distributions, contents] = await Promise.all([
      prisma.product.findMany({
        where: {
          campaign: { not: null },
        },
        select: {
          id: true,
          productName: true,
          brand: true,
          price: true,
          commissionRate: true,
          campaign: true,
        },
      }),
      prisma.distribution.findMany({
        where: {
          campaign: { not: null },
        },
        include: {
          platform: { select: { name: true, platformType: true } },
          persona: { select: { name: true } },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  productName: true,
                  brand: true,
                  price: true,
                  commissionRate: true,
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
        where: {
          campaign: { not: null },
        },
        include: {
          persona: { select: { name: true } },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  productName: true,
                  brand: true,
                  price: true,
                  commissionRate: true,
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
    ]);

    // Grouping by normalized campaign name
    const campaignMap = new Map<string, CampaignSummary>();

    const getOrCreate = (rawName: string): CampaignSummary => {
      const cleanName = rawName.trim();
      const key = cleanName.toLowerCase();
      if (!campaignMap.has(key)) {
        campaignMap.set(key, {
          name: cleanName,
          productCount: 0,
          distributionCount: 0,
          contentCount: 0,
          totalViews: 0,
          totalClicks: 0,
          totalOrders: 0,
          estimatedEarnings: 0,
          products: [],
          distributions: [],
          contents: [],
        });
      }
      return campaignMap.get(key)!;
    };

    // 1. Process Products
    for (const prod of products) {
      if (!prod.campaign || prod.campaign.trim() === "") continue;
      const c = getOrCreate(prod.campaign);
      if (!c.products.some((p) => p.id === prod.id)) {
        c.products.push({
          id: prod.id,
          productName: prod.productName,
          brand: prod.brand,
          price: Number(prod.price),
          commissionRate: Number(prod.commissionRate),
        });
        c.productCount += 1;
      }
    }

    // 2. Process Distributions
    for (const dist of distributions) {
      if (!dist.campaign || dist.campaign.trim() === "") continue;
      const c = getOrCreate(dist.campaign);
      c.distributionCount += 1;

      const latestEng = dist.engagements[0];
      const views = latestEng?.viewsCount || 0;
      const clicks = latestEng?.clicksCount || 0;
      const orders = latestEng?.ordersCount || 0;

      c.totalViews += views;
      c.totalClicks += clicks;
      c.totalOrders += orders;

      // Add products from distribution items if not yet in campaign products
      for (const item of dist.items) {
        if (!c.products.some((p) => p.id === item.product.id)) {
          c.products.push({
            id: item.product.id,
            productName: item.product.productName,
            brand: item.product.brand,
            price: Number(item.product.price),
            commissionRate: Number(item.product.commissionRate),
          });
          c.productCount = c.products.length;
        }
      }

      // Calculate earnings
      if (orders > 0 && dist.items.length > 0) {
        const avgComm =
          dist.items.reduce(
            (sum, item) =>
              sum +
              (Number(item.product.price) * Number(item.product.commissionRate)) / 100,
            0
          ) / dist.items.length;
        c.estimatedEarnings += orders * avgComm;
      }

      c.distributions.push({
        id: dist.id,
        platformName: dist.platform.name,
        platformType: dist.platform.platformType,
        personaName: dist.persona.name,
        postedAt: dist.postedAt,
        status: dist.status,
        postUrl: dist.postUrl,
        views,
        clicks,
        orders,
      });
    }

    // 3. Process Content
    for (const cnt of contents) {
      if (!cnt.campaign || cnt.campaign.trim() === "") continue;
      const c = getOrCreate(cnt.campaign);
      c.contentCount += 1;

      const latestMetric = cnt.metrics[0];
      const views = latestMetric?.viewsCount || 0;
      const clicks = latestMetric?.clicksCount || 0;

      c.totalViews += views;
      c.totalClicks += clicks;

      // Add featured products if not yet present
      for (const cp of cnt.products) {
        if (!c.products.some((p) => p.id === cp.product.id)) {
          c.products.push({
            id: cp.product.id,
            productName: cp.product.productName,
            brand: cp.product.brand,
            price: Number(cp.product.price),
            commissionRate: Number(cp.product.commissionRate),
          });
          c.productCount = c.products.length;
        }
      }

      c.contents.push({
        id: cnt.id,
        title: cnt.title,
        contentType: cnt.contentType,
        personaName: cnt.persona.name,
        publishedAt: cnt.publishedAt,
        platformUrl: cnt.platformUrl,
        views,
        clicks,
      });
    }

    const result = Array.from(campaignMap.values()).sort(
      (a, b) => b.estimatedEarnings - a.estimatedEarnings || b.totalClicks - a.totalClicks
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting campaign analytics:", error);
    return { success: false, data: [], error: "Gagal mengambil data analitik campaign" };
  }
}
