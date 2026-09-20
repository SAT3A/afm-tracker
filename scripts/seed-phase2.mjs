import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Phase 2 data...");

  // 1. Ensure Personas
  const bagas = await prisma.persona.upsert({
    where: { id: "persona_bagas_01" },
    update: {},
    create: {
      id: "persona_bagas_01",
      name: "Bagas",
      niches: ["gym", "outfit", "parfum", "lifestyle cowok"],
      description: "Persona AI untuk konten lifestyle cowok, rekomendasi gym outfit, dan review parfum.",
      status: "active",
    },
  });

  const naya = await prisma.persona.upsert({
    where: { id: "persona_naya_02" },
    update: {},
    create: {
      id: "persona_naya_02",
      name: "Naya",
      niches: ["skincare", "homeliving", "beauty"],
      description: "Persona AI untuk review skincare, kecantikan, dan pernak-pernik home living.",
      status: "active",
    },
  });

  // 2. Sample Products
  const p1 = await prisma.product.upsert({
    where: { id: "prod_sample_01" },
    update: {},
    create: {
      id: "prod_sample_01",
      brand: "Somethinc",
      category: "Skincare",
      productName: "10% Niacinamide + Moisture Sabi Beet Serum",
      variant: "20ml",
      affiliateLink: "https://shope.ee/somethinc-niacinamide",
      originalLink: "https://shopee.co.id/product/12345/67890",
      price: 119000,
      commissionRate: 10.0,
      tags: ["Promo 9.9", "Best Seller"],
      campaign: "9.9 Super Deal",
      status: "active",
      notes: "Produk viral skincare, konversi tinggi",
    },
  });

  const p2 = await prisma.product.upsert({
    where: { id: "prod_sample_02" },
    update: {},
    create: {
      id: "prod_sample_02",
      brand: "Skintific",
      category: "Skincare",
      productName: "5X Ceramide Barrier Moisture Gel",
      variant: "30g",
      affiliateLink: "https://shope.ee/skintific-5x-ceramide",
      originalLink: "https://shopee.co.id/product/54321/98765",
      price: 139000,
      commissionRate: 12.0,
      tags: ["Viral TikTok", "Moisturizer"],
      campaign: "9.9 Super Deal",
      status: "active",
      notes: "Pelembab barrier paling laris",
    },
  });

  const p3 = await prisma.product.upsert({
    where: { id: "prod_sample_03" },
    update: {},
    create: {
      id: "prod_sample_03",
      brand: "Kahf",
      category: "Perawatan Pria",
      productName: "Oil and Acne Care Face Wash 100ml",
      variant: "100ml",
      affiliateLink: "https://shope.ee/kahf-face-wash",
      originalLink: "https://shopee.co.id/product/11111/22222",
      price: 38500,
      commissionRate: 8.0,
      tags: ["Grooming Pria", "Daily"],
      campaign: "Gajian Sale",
      status: "active",
      notes: "Sabun cuci muka cowok daily use",
    },
  });

  const p4 = await prisma.product.upsert({
    where: { id: "prod_sample_04" },
    update: {},
    create: {
      id: "prod_sample_04",
      brand: "HMNS",
      category: "Parfum",
      productName: "Perfume - Orgasm 100ml",
      variant: "100ml",
      affiliateLink: "https://shope.ee/hmns-orgasm",
      originalLink: "https://shopee.co.id/product/33333/44444",
      price: 328000,
      commissionRate: 15.0,
      tags: ["High Commission", "Parfum"],
      campaign: "Gajian Sale",
      status: "active",
      notes: "Komisi besar Rp 49.200 per botol",
    },
  });

  const p5 = await prisma.product.upsert({
    where: { id: "prod_sample_05" },
    update: {},
    create: {
      id: "prod_sample_05",
      brand: "MuscleFit",
      category: "Fashion Pria",
      productName: "Kaos Gym Dry-Fit Muscle Fit Anti Gerah",
      variant: "Hitam / L",
      affiliateLink: "https://shope.ee/kaos-gym-musclefit",
      originalLink: "https://shopee.co.id/product/55555/66666",
      price: 75000,
      commissionRate: 10.0,
      tags: ["Gym", "Workout"],
      campaign: "Weekend Deals",
      status: "active",
      notes: "Bagus dipromosikan di grup gym / workout",
    },
  });

  // 3. Sample Platforms
  const plat1 = await prisma.platform.upsert({
    where: { id: "plat_sample_01" },
    update: {},
    create: {
      id: "plat_sample_01",
      name: "Grup Racun Shopee Affiliate Indonesia",
      platformType: "facebook",
      category: "Sebar link shopee affiliate",
      requiresApproval: false,
      url: "https://facebook.com/groups/racunshopeeindo",
      status: "active",
    },
  });

  const plat2 = await prisma.platform.upsert({
    where: { id: "plat_sample_02" },
    update: {},
    create: {
      id: "plat_sample_02",
      name: "Komunitas Skincare & Glowing Sehat FB",
      platformType: "facebook",
      category: "Skincare & Beauty",
      requiresApproval: true,
      url: "https://facebook.com/groups/skincaresehatfb",
      status: "active",
    },
  });

  const plat3 = await prisma.platform.upsert({
    where: { id: "plat_sample_03" },
    update: {},
    create: {
      id: "plat_sample_03",
      name: "Outfit & Lifestyle Cowok Keren",
      platformType: "facebook",
      category: "Fashion Pria",
      requiresApproval: false,
      url: "https://facebook.com/groups/outfitcowokkeren",
      status: "active",
    },
  });

  const plat4 = await prisma.platform.upsert({
    where: { id: "plat_sample_04" },
    update: {},
    create: {
      id: "plat_sample_04",
      name: "@racun.affiliate.id",
      platformType: "instagram",
      category: "Katalog Produk Affiliate",
      requiresApproval: false,
      url: "https://instagram.com/racun.affiliate.id",
      status: "active",
    },
  });

  // 4. Sample Distributions with Items & Engagements
  const dist1 = await prisma.distribution.upsert({
    where: { id: "dist_sample_01" },
    update: {},
    create: {
      id: "dist_sample_01",
      platformId: plat1.id,
      personaId: naya.id,
      distributionType: "comment",
      postUrl: "https://facebook.com/groups/racunshopeeindo/posts/101",
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "posted",
      campaign: "9.9 Super Deal",
      notes: "Komentar rekomendasi serum & moisturizer",
    },
  });

  await prisma.distributionItem.upsert({
    where: {
      distributionId_productId: {
        distributionId: dist1.id,
        productId: p1.id,
      },
    },
    update: {},
    create: { distributionId: dist1.id, productId: p1.id },
  });

  await prisma.distributionItem.upsert({
    where: {
      distributionId_productId: {
        distributionId: dist1.id,
        productId: p2.id,
      },
    },
    update: {},
    create: { distributionId: dist1.id, productId: p2.id },
  });

  // Add engagement for dist1
  await prisma.distributionEngagement.create({
    data: {
      distributionId: dist1.id,
      viewsCount: 3500,
      likesCount: 145,
      sharesCount: 12,
      clicksCount: 88,
      ordersCount: 9,
      capturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const dist2 = await prisma.distribution.upsert({
    where: { id: "dist_sample_02" },
    update: {},
    create: {
      id: "dist_sample_02",
      platformId: plat3.id,
      personaId: bagas.id,
      distributionType: "post",
      postUrl: "https://facebook.com/groups/outfitcowokkeren/posts/202",
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      status: "posted",
      campaign: "Gajian Sale",
      notes: "Postingan rekomendasi parfum & sabun cuci muka cowok",
    },
  });

  await prisma.distributionItem.upsert({
    where: {
      distributionId_productId: {
        distributionId: dist2.id,
        productId: p3.id,
      },
    },
    update: {},
    create: { distributionId: dist2.id, productId: p3.id },
  });

  await prisma.distributionItem.upsert({
    where: {
      distributionId_productId: {
        distributionId: dist2.id,
        productId: p4.id,
      },
    },
    update: {},
    create: { distributionId: dist2.id, productId: p4.id },
  });

  await prisma.distributionEngagement.create({
    data: {
      distributionId: dist2.id,
      viewsCount: 5200,
      likesCount: 230,
      sharesCount: 25,
      clicksCount: 142,
      ordersCount: 14,
      capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Sample Video Content & Metrics
  const content1 = await prisma.content.upsert({
    where: { id: "content_sample_01" },
    update: {},
    create: {
      id: "content_sample_01",
      personaId: naya.id,
      title: "Review 2 Serum Mencerahkan Terbaik Buat Bekas Jerawat Membandel",
      contentType: "shopee_video",
      platformUrl: "https://shopee.co.id/universal-link/sv/video-serum-review",
      campaign: "9.9 Super Deal",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "published",
      notes: "Fokus ke perbandingan hasil pemakaian 14 hari",
    },
  });

  await prisma.contentProduct.upsert({
    where: {
      contentId_productId: {
        contentId: content1.id,
        productId: p1.id,
      },
    },
    update: {},
    create: { contentId: content1.id, productId: p1.id },
  });

  await prisma.contentProduct.upsert({
    where: {
      contentId_productId: {
        contentId: content1.id,
        productId: p2.id,
      },
    },
    update: {},
    create: { contentId: content1.id, productId: p2.id },
  });

  await prisma.contentMetric.create({
    data: {
      contentId: content1.id,
      viewsCount: 12500,
      likesCount: 890,
      commentsCount: 45,
      sharesCount: 120,
      savesCount: 310,
      clicksCount: 340,
      capturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const content2 = await prisma.content.upsert({
    where: { id: "content_sample_02" },
    update: {},
    create: {
      id: "content_sample_02",
      personaId: bagas.id,
      title: "Tips Grooming & Parfum Cowok yang Bikin Cewek Auto Noleh",
      contentType: "fb_reels",
      platformUrl: "https://facebook.com/reel/1234567890",
      campaign: "Gajian Sale",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "published",
      notes: "Review aroma HMNS Orgasm + Kahf Face Wash",
    },
  });

  await prisma.contentProduct.upsert({
    where: {
      contentId_productId: {
        contentId: content2.id,
        productId: p3.id,
      },
    },
    update: {},
    create: { contentId: content2.id, productId: p3.id },
  });

  await prisma.contentProduct.upsert({
    where: {
      contentId_productId: {
        contentId: content2.id,
        productId: p4.id,
      },
    },
    update: {},
    create: { contentId: content2.id, productId: p4.id },
  });

  await prisma.contentMetric.create({
    data: {
      contentId: content2.id,
      viewsCount: 8700,
      likesCount: 620,
      commentsCount: 28,
      sharesCount: 95,
      savesCount: 180,
      clicksCount: 210,
      capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const content3 = await prisma.content.upsert({
    where: { id: "content_sample_03" },
    update: {},
    create: {
      id: "content_sample_03",
      personaId: bagas.id,
      title: "Rekomendasi Kaos Gym Anti Gerah Cuma 70 Ribuan!",
      contentType: "ig_reels",
      platformUrl: "https://instagram.com/reel/9876543210",
      campaign: "Weekend Deals",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "published",
      notes: "Outfit gym keren hemat budget",
    },
  });

  await prisma.contentProduct.upsert({
    where: {
      contentId_productId: {
        contentId: content3.id,
        productId: p5.id,
      },
    },
    update: {},
    create: { contentId: content3.id, productId: p5.id },
  });

  await prisma.contentMetric.create({
    data: {
      contentId: content3.id,
      viewsCount: 15400,
      likesCount: 1100,
      commentsCount: 85,
      sharesCount: 230,
      savesCount: 420,
      clicksCount: 490,
      capturedAt: new Date(),
    },
  });

  console.log("✅ Phase 2 sample data seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
