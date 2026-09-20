import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding realistic Phase 3 data for AFM Tracker...");

  // 1. PERSONAS (Bagas, Naya, Dimas, Aurel)
  console.log("👤 Creating / updating personas...");
  const bagas = await prisma.persona.upsert({
    where: { id: "persona_bagas_01" },
    update: {
      name: "Bagas",
      niches: ["gym", "outfit", "parfum", "lifestyle cowok"],
      description: "Persona AI untuk konten lifestyle cowok, rekomendasi gym outfit, dan review parfum pria.",
      status: "active",
    },
    create: {
      id: "persona_bagas_01",
      name: "Bagas",
      niches: ["gym", "outfit", "parfum", "lifestyle cowok"],
      description: "Persona AI untuk konten lifestyle cowok, rekomendasi gym outfit, dan review parfum pria.",
      status: "active",
    },
  });

  const naya = await prisma.persona.upsert({
    where: { id: "persona_naya_02" },
    update: {
      name: "Naya",
      niches: ["skincare", "homeliving", "beauty", "dekorasi"],
      description: "Persona AI untuk review skincare, kecantikan, dan pernak-pernik home living aesthetic.",
      status: "active",
    },
    create: {
      id: "persona_naya_02",
      name: "Naya",
      niches: ["skincare", "homeliving", "beauty", "dekorasi"],
      description: "Persona AI untuk review skincare, kecantikan, dan pernak-pernik home living aesthetic.",
      status: "active",
    },
  });

  const dimas = await prisma.persona.upsert({
    where: { id: "persona_dimas_03" },
    update: {
      name: "Dimas",
      niches: ["tech", "gadget", "gaming", "elektronik", "setup desk"],
      description: "Persona AI spesialis rekomendasi gadget, aksesoris setup meja kerja, dan perlengkapan gaming hemat.",
      status: "active",
    },
    create: {
      id: "persona_dimas_03",
      name: "Dimas",
      niches: ["tech", "gadget", "gaming", "elektronik", "setup desk"],
      description: "Persona AI spesialis rekomendasi gadget, aksesoris setup meja kerja, dan perlengkapan gaming hemat.",
      status: "active",
    },
  });

  const aurel = await prisma.persona.upsert({
    where: { id: "persona_aurel_04" },
    update: {
      name: "Aurel",
      niches: ["fashion cewek", "hijab", "ootd", "skincare", "tas"],
      description: "Persona AI inspirasi OOTD hijab kasual, rekomendasi tas wanita, dan skincare harian.",
      status: "active",
    },
    create: {
      id: "persona_aurel_04",
      name: "Aurel",
      niches: ["fashion cewek", "hijab", "ootd", "skincare", "tas"],
      description: "Persona AI inspirasi OOTD hijab kasual, rekomendasi tas wanita, dan skincare harian.",
      status: "active",
    },
  });

  const personas = [bagas, naya, dimas, aurel];

  // 2. PLATFORMS
  console.log("🌐 Creating / updating platforms...");
  const platformData = [
    { id: "plat_fb_01", platformType: "facebook", name: "Grup Racun Shopee Check Official", category: "Sebar link shopee affiliate", requiresApproval: false, url: "https://facebook.com/groups/racunshopee" },
    { id: "plat_fb_02", platformType: "facebook", name: "Komunitas Skincare & Glowing Indonesia", category: "Beauty & Skincare", requiresApproval: true, url: "https://facebook.com/groups/skincareindonesia" },
    { id: "plat_fb_03", platformType: "facebook", name: "OOTD Pria & Streetwear ID", category: "Fashion Cowok", requiresApproval: false, url: "https://facebook.com/groups/ootdcowok" },
    { id: "plat_fb_04", platformType: "facebook", name: "Inspirasi Dekor Kamar Kos Aesthetic", category: "Home Living", requiresApproval: false, url: "https://facebook.com/groups/dekorkamar" },
    { id: "plat_fb_05", platformType: "facebook", name: "Grup Promo & Diskon Kilat Shopee 2026", category: "Diskon & Voucher", requiresApproval: false, url: "https://facebook.com/groups/diskonkilat" },
    { id: "plat_ig_01", platformType: "instagram", name: "@racun.shopee.haul", category: "Akun Curasi Racun", requiresApproval: false, url: "https://instagram.com/racun.shopee.haul" },
    { id: "plat_ig_02", platformType: "instagram", name: "@naya.beautytips", category: "Akun Personal Creator", requiresApproval: false, url: "https://instagram.com/naya.beautytips" },
    { id: "plat_ig_03", platformType: "instagram", name: "@bagas.fitstyle", category: "Akun Personal Creator", requiresApproval: false, url: "https://instagram.com/bagas.fitstyle" },
    { id: "plat_tk_01", platformType: "tiktok", name: "TikTok @racunshopeeviral", category: "Short Video FYP", requiresApproval: false, url: "https://tiktok.com/@racunshopeeviral" },
    { id: "plat_tk_02", platformType: "tiktok", name: "TikTok @dimas_gadget", category: "Review Gadget & Setup", requiresApproval: false, url: "https://tiktok.com/@dimas_gadget" },
    { id: "plat_th_01", platformType: "threads", name: "Threads @spillracunshopee", category: "Curhat & Spill Link", requiresApproval: false, url: "https://threads.net/@spillracunshopee" },
  ];

  const platforms = [];
  for (const pl of platformData) {
    const res = await prisma.platform.upsert({
      where: { id: pl.id },
      update: pl,
      create: pl,
    });
    platforms.push(res);
  }

  // 3. PRODUCTS (20+ Top Real Shopee Affiliate Products)
  console.log("📦 Creating / updating products...");
  const productsData = [
    { id: "prod_01", brand: "Somethinc", category: "Skincare", productName: "10% Niacinamide + Moisture Sabi Beet Serum 20ml", variant: "20ml", price: 119000, commissionRate: 10.0, campaign: "Promo 9.9 Super Shopping Day", affiliateLink: "https://shope.ee/somethinc-niacinamide", tags: ["Viral", "Best Seller", "Promo 9.9"] },
    { id: "prod_02", brand: "Skintific", category: "Skincare", productName: "5X Ceramide Barrier Moisture Gel 30g", variant: "30g", price: 139000, commissionRate: 12.0, campaign: "Promo 9.9 Super Shopping Day", affiliateLink: "https://shope.ee/skintific-ceramide", tags: ["Moisturizer", "Viral TikTok", "Promo 9.9"] },
    { id: "prod_03", brand: "Kahf", category: "Perawatan Pria", productName: "Oil and Acne Care Face Wash 100ml", variant: "100ml", price: 38500, commissionRate: 8.0, campaign: "Gajian Sale Hemat", affiliateLink: "https://shope.ee/kahf-facewash", tags: ["Daily Use", "Cowok", "Gajian Sale"] },
    { id: "prod_04", brand: "HMNS", category: "Parfum", productName: "Perfume Orgasm 100ml EDP", variant: "100ml", price: 328000, commissionRate: 12.0, campaign: "Spill Racun Shopee Viral", affiliateLink: "https://shope.ee/hmns-orgasm", tags: ["High Commission", "Parfum Mewah"] },
    { id: "prod_05", brand: "Erigo", category: "Fashion", productName: "Kemeja Flannel Oversize Unisex Red Tartan", variant: "L", price: 95000, commissionRate: 9.0, campaign: "Promo 9.9 Super Shopping Day", affiliateLink: "https://shope.ee/erigo-flannel", tags: ["OOTD", "Casual", "Promo 9.9"] },
    { id: "prod_06", brand: "Avoskin", category: "Skincare", productName: "Miraculous Retinol Toner 100ml", variant: "100ml", price: 199000, commissionRate: 11.0, campaign: "Brand Day Somethinc x Skintific", affiliateLink: "https://shope.ee/avoskin-retinol", tags: ["Anti Aging", "Toner Viral"] },
    { id: "prod_07", brand: "Baseus", category: "Elektronik", productName: "Bowie WM02 TWS Earphone Bluetooth 5.3", variant: "Black", price: 179000, commissionRate: 10.0, campaign: "Gajian Sale Hemat", affiliateLink: "https://shope.ee/baseus-wm02", tags: ["Gadget", "TWS Murah"] },
    { id: "prod_08", brand: "The Originote", category: "Skincare", productName: "Hyalucera Moisturizer Gel 50g", variant: "50g", price: 42000, commissionRate: 8.5, campaign: "Spill Racun Shopee Viral", affiliateLink: "https://shope.ee/originote-hyalucera", tags: ["Budget Skincare", "Viral"] },
    { id: "prod_09", brand: "Eiger", category: "Fashion", productName: "WS Riding Raincoat Setelan Jas Hujan", variant: "XL", price: 349000, commissionRate: 10.0, campaign: "Flash Sale Weekend", affiliateLink: "https://shope.ee/eiger-raincoat", tags: ["Outdoor", "Riding"] },
    { id: "prod_10", brand: "Oxone", category: "Home Living", productName: "Eco Air Fryer 3.5L Low Watt OX-199N", variant: "White", price: 549000, commissionRate: 14.0, campaign: "Home Living Aesthetic Fair", affiliateLink: "https://shope.ee/oxone-airfryer", tags: ["Dapur", "High Commission"] },
    { id: "prod_11", brand: "Brodo", category: "Fashion", productName: "Sepatu Sneaker Vantage V2 Low All Black", variant: "42", price: 289000, commissionRate: 10.0, campaign: "Gajian Sale Hemat", affiliateLink: "https://shope.ee/brodo-vantage", tags: ["Sepatu Cowok", "Sneakers"] },
    { id: "prod_12", brand: "Scarlett", category: "Skincare", productName: "Fragrance Brightening Body Lotion Jolly 300ml", variant: "300ml", price: 75000, commissionRate: 9.0, campaign: "Beauty Glow Up Festival", affiliateLink: "https://shope.ee/scarlett-jolly", tags: ["Bodycare", "Wangi Mewah"] },
    { id: "prod_13", brand: "Philips", category: "Home Living", productName: "Lampu Meja LED EyeCare Dimmable", variant: "White", price: 189000, commissionRate: 10.0, campaign: "Home Living Aesthetic Fair", affiliateLink: "https://shope.ee/philips-eyecare", tags: ["Setup Desk", "Lampu Belajar"] },
    { id: "prod_14", brand: "Evolene", category: "Gym & Fitness", productName: "Evowhey 100% Whey Protein Isolate 2 Lbs", variant: "Chocolate", price: 415000, commissionRate: 12.0, campaign: "Flash Sale Weekend", affiliateLink: "https://shope.ee/evolene-whey", tags: ["Gym", "High Ticket"] },
    { id: "prod_15", brand: "Wardah", category: "Skincare", productName: "Colorfit Velvet Matte Lip Mousse", variant: "09 Ombre", price: 68000, commissionRate: 8.0, campaign: "Beauty Glow Up Festival", affiliateLink: "https://shope.ee/wardah-colorfit", tags: ["Makeup", "Lipstick"] },
  ];

  const products = [];
  for (const pr of productsData) {
    const res = await prisma.product.upsert({
      where: { id: pr.id },
      update: pr,
      create: pr,
    });
    products.push(res);
  }

  // 4. GENERATE 35+ REALISTIC CONTENT AI VIDEOS
  console.log("🎬 Generating 35 realistic Content AI videos...");
  const contentVideoTemplates = [
    { title: "Review Jujur Serum Somethinc Setelah 30 Hari: Flek Hitam Beneran Pudar?", type: "shopee_video", pId: bagas.id, prodIdx: 0, camp: "Promo 9.9 Super Shopping Day", views: 24500, clicks: 1280, likes: 1850 },
    { title: "Racun Kemeja Oversized Erigo Buat Kuliah & Nongkrong — Cuma 90 Ribuan!", type: "fb_reels", pId: bagas.id, prodIdx: 4, camp: "Promo 9.9 Super Shopping Day", views: 18200, clicks: 940, likes: 1420 },
    { title: "Spill Parfum HMNS Orgasm: Wangi Mewah Tahan 12 Jam di Shopee Cuma Segini", type: "ig_reels", pId: bagas.id, prodIdx: 3, camp: "Spill Racun Shopee Viral", views: 42000, clicks: 2150, likes: 3800 },
    { title: "Skincare Routine Naya Pasca Lembur: Hempas Jerawat & Kusam dalam 3 Hari", type: "shopee_video", pId: naya.id, prodIdx: 1, camp: "Brand Day Somethinc x Skintific", views: 31000, clicks: 1620, likes: 2400 },
    { title: "Shopee Haul: 5 Pernak Pernik Kamar Kos Estetik di Bawah 50 Ribu!", type: "tiktok", pId: naya.id, prodIdx: 12, camp: "Home Living Aesthetic Fair", views: 55000, clicks: 3100, likes: 5200 },
    { title: "Outfit Gym Bagas: Celana Dryfit + Baju Kompresi Murah tapi Nggak Panas", type: "ig_reels", pId: bagas.id, prodIdx: 13, camp: "Flash Sale Weekend", views: 14200, clicks: 710, likes: 980 },
    { title: "Unboxing & Review TWS Baseus WM02: Baterai Tahan 25 Jam Suara Nendang", type: "tiktok", pId: dimas.id, prodIdx: 6, camp: "Gajian Sale Hemat", views: 38500, clicks: 1950, likes: 3100 },
    { title: "Tutorial Makeup Daily Natural ala Naya Pakai Produk di Bawah 100rb", type: "shopee_video", pId: naya.id, prodIdx: 14, camp: "Beauty Glow Up Festival", views: 27800, clicks: 1430, likes: 2150 },
    { title: "Spill Avoskin Retinol Toner: Efektif Banget Buat Halusin Tekstur Kulit", type: "ig_reels", pId: naya.id, prodIdx: 5, camp: "Brand Day Somethinc x Skintific", views: 19400, clicks: 890, likes: 1350 },
    { title: "Review Kaos Polos Heavyweight Cotton Combed: Tebal & Nggak Nerawang", type: "fb_reels", pId: bagas.id, prodIdx: 4, camp: "Gajian Sale Hemat", views: 12800, clicks: 620, likes: 890 },
    { title: "Air Fryer Oxone Low Watt: Bikin Ayam Goreng Crispy Tanpa Minyak!", type: "tiktok", pId: naya.id, prodIdx: 9, camp: "Home Living Aesthetic Fair", views: 46000, clicks: 2480, likes: 4100 },
    { title: "Review Skintific 5X Ceramide Barrier: Penyelamat Kulit Bruntusan", type: "shopee_video", pId: naya.id, prodIdx: 1, camp: "Promo 9.9 Super Shopping Day", views: 36000, clicks: 1890, likes: 2950 },
    { title: "Haul OOTD Hijab Pashmina Silk Shimmer: Mewah & Nggak Licin!", type: "ig_reels", pId: aurel.id, prodIdx: 4, camp: "Promo 9.9 Super Shopping Day", views: 29000, clicks: 1560, likes: 2450 },
    { title: "Spill Mouse Wireless Silent Baseus: Solusi Ngetik Santai Tanpa Berisik", type: "shopee_video", pId: dimas.id, prodIdx: 6, camp: "Gajian Sale Hemat", views: 16500, clicks: 780, likes: 1100 },
    { title: "Serum Bulu Mata & Alis Viral di Shopee: 2 Minggu Udah Keliatan Tebal!", type: "tiktok", pId: aurel.id, prodIdx: 7, camp: "Beauty Glow Up Festival", views: 48000, clicks: 2600, likes: 3900 },
    { title: "Lampu Meja Belajar LED Aesthetic: Bisa Dimmable & Nyaman di Mata", type: "ig_reels", pId: dimas.id, prodIdx: 12, camp: "Home Living Aesthetic Fair", views: 15200, clicks: 690, likes: 1050 },
    { title: "Suplemen Whey Protein Halal BPOM: Rasa Coklat Enak Nggak Enek", type: "shopee_video", pId: bagas.id, prodIdx: 13, camp: "Flash Sale Weekend", views: 22000, clicks: 1150, likes: 1780 },
    { title: "Lip Velvet Wardah Colorfit: Transferproof Seharian Nggak Bikin Kering", type: "fb_reels", pId: aurel.id, prodIdx: 14, camp: "Beauty Glow Up Festival", views: 17800, clicks: 840, likes: 1290 },
    { title: "TWS Anker vs Baseus WM02: Mana yang Paling Worth It di Bawah 200rb?", type: "tiktok", pId: dimas.id, prodIdx: 6, camp: "Gajian Sale Hemat", views: 34000, clicks: 1750, likes: 2800 },
    { title: "Sandal Slide Pria Anti Slip: Nyaman Dipakai Harian & Anti Becek", type: "fb_reels", pId: bagas.id, prodIdx: 10, camp: "Gajian Sale Hemat", views: 11500, clicks: 540, likes: 780 },
    { title: "Sunscreen Azarine vs Skintific: Battle Sunscreen Ter-Ringan Buat Kulit Berminyak", type: "shopee_video", pId: naya.id, prodIdx: 1, camp: "Promo 9.9 Super Shopping Day", views: 39000, clicks: 2100, likes: 3200 },
    { title: "Organizer Meja Kosmetik Putar 360 Derajat: Kamar Langsung Rapi Seketika", type: "tiktok", pId: aurel.id, prodIdx: 12, camp: "Home Living Aesthetic Fair", views: 26500, clicks: 1320, likes: 1980 },
    { title: "Tas Ransel Laptop Anti Maling Water Resistant Buat Kerja & Kampus", type: "ig_reels", pId: dimas.id, prodIdx: 8, camp: "Gajian Sale Hemat", views: 21000, clicks: 1050, likes: 1650 },
    { title: "Body Lotion Scarlett Jolly: Wangi Mirip Parfum Mahal YSL Black Opium", type: "shopee_video", pId: aurel.id, prodIdx: 11, camp: "Spill Racun Shopee Viral", views: 33000, clicks: 1780, likes: 2600 },
    { title: "Review Diffuser Humidifier Aromaterapi: Bikin Kamar Wangi Hotel Bintang 5", type: "tiktok", pId: naya.id, prodIdx: 12, camp: "Home Living Aesthetic Fair", views: 41000, clicks: 2200, likes: 3400 },
    { title: "Smart Desk Mat Kulit PU: Bikin Setup Meja Kerja Makin Rapi & Elegan", type: "shopee_video", pId: dimas.id, prodIdx: 6, camp: "Gajian Sale Hemat", views: 14800, clicks: 720, likes: 1120 },
    { title: "Deodorant Roll On Kahf: Anti Bau Badan Seharian Nggak Bikin Baju Kuning", type: "fb_reels", pId: bagas.id, prodIdx: 2, camp: "Gajian Sale Hemat", views: 13500, clicks: 680, likes: 950 },
    { title: "Cushion Somethinc Hooman: Coverage Tinggi tapi Ringan Nggak Dempul", type: "ig_reels", pId: naya.id, prodIdx: 0, camp: "Brand Day Somethinc x Skintific", views: 28500, clicks: 1490, likes: 2280 },
    { title: "Powerbank 20000mAh Fast Charging Baseus: Support PD 20W Aman Masuk Pesawat", type: "tiktok", pId: dimas.id, prodIdx: 6, camp: "Flash Sale Weekend", views: 31500, clicks: 1620, likes: 2500 },
    { title: "Parfum Kahf vs HMNS: Mana yang Paling Disukai Cewek?", type: "shopee_video", pId: bagas.id, prodIdx: 3, camp: "Spill Racun Shopee Viral", views: 45000, clicks: 2400, likes: 3950 },
    { title: "Celana Chino Pria Slim Fit Stretch: Lentur & Nyaman Buat Ngantor", type: "fb_reels", pId: bagas.id, prodIdx: 4, camp: "Promo 9.9 Super Shopping Day", views: 15400, clicks: 760, likes: 1190 },
    { title: "Rak Piring Stainless Steel 2 Tingkat: Hemat Ruang Dapur Minimalis", type: "tiktok", pId: naya.id, prodIdx: 9, camp: "Home Living Aesthetic Fair", views: 23000, clicks: 1180, likes: 1720 },
    { title: "Sneakers Brodo Vantage V2: Sepatu Kuliah Lokal yang Kuat & Trendy", type: "ig_reels", pId: bagas.id, prodIdx: 10, camp: "Gajian Sale Hemat", views: 19800, clicks: 960, likes: 1480 },
    { title: "Serum The Originote Hyalucera: Pelembab 40 Ribuan Terbaik Buat Remaja", type: "shopee_video", pId: aurel.id, prodIdx: 7, camp: "Spill Racun Shopee Viral", views: 37000, clicks: 1920, likes: 2980 },
    { title: "Jas Hujan Eiger Setelan: Tetap Kering Walau Badai di Jalanan!", type: "fb_reels", pId: bagas.id, prodIdx: 8, camp: "Flash Sale Weekend", views: 16800, clicks: 820, likes: 1250 },
  ];

  for (let i = 0; i < contentVideoTemplates.length; i++) {
    const t = contentVideoTemplates[i];
    const contentId = `content_real_${String(i + 1).padStart(2, "0")}`;
    const pubDate = new Date(2026, 8, Math.max(1, 20 - Math.floor(i / 2)), 12 + (i % 8), (i * 7) % 60);

    const c = await prisma.content.upsert({
      where: { id: contentId },
      update: {
        title: t.title,
        contentType: t.type,
        personaId: t.pId,
        campaign: t.camp,
        platformUrl: `https://${t.type === "shopee_video" ? "shopee.co.id/universal-link" : t.type === "tiktok" ? "tiktok.com/@video" : "instagram.com/reels"}/${contentId}`,
        publishedAt: pubDate,
        status: "published",
        notes: `Konten video viral affiliate oleh persona ${t.pId === bagas.id ? "Bagas" : t.pId === naya.id ? "Naya" : t.pId === dimas.id ? "Dimas" : "Aurel"}.`,
      },
      create: {
        id: contentId,
        title: t.title,
        contentType: t.type,
        personaId: t.pId,
        campaign: t.camp,
        platformUrl: `https://${t.type === "shopee_video" ? "shopee.co.id/universal-link" : t.type === "tiktok" ? "tiktok.com/@video" : "instagram.com/reels"}/${contentId}`,
        publishedAt: pubDate,
        status: "published",
        notes: `Konten video viral affiliate oleh persona ${t.pId === bagas.id ? "Bagas" : t.pId === naya.id ? "Naya" : t.pId === dimas.id ? "Dimas" : "Aurel"}.`,
      },
    });

    // Link product
    const prod = products[t.prodIdx];
    if (prod) {
      await prisma.contentProduct.upsert({
        where: {
          contentId_productId: {
            contentId: c.id,
            productId: prod.id,
          },
        },
        update: {},
        create: {
          contentId: c.id,
          productId: prod.id,
        },
      });
    }

    // Add Metric
    const metricId = `metric_real_${String(i + 1).padStart(2, "0")}`;
    await prisma.contentMetric.upsert({
      where: { id: metricId },
      update: {
        viewsCount: t.views,
        likesCount: t.likes,
        commentsCount: Math.round(t.likes * 0.1),
        sharesCount: Math.round(t.likes * 0.15),
        clicksCount: t.clicks,
        capturedAt: new Date(pubDate.getTime() + 24 * 3600 * 1000),
      },
      create: {
        id: metricId,
        contentId: c.id,
        viewsCount: t.views,
        likesCount: t.likes,
        commentsCount: Math.round(t.likes * 0.1),
        sharesCount: Math.round(t.likes * 0.15),
        clicksCount: t.clicks,
        capturedAt: new Date(pubDate.getTime() + 24 * 3600 * 1000),
      },
    });
  }

  // 5. DISTRIBUTIONS (35+ realistic records with engagements)
  console.log("📢 Generating 35 realistic distributions & engagements...");
  for (let i = 0; i < 35; i++) {
    const distId = `dist_real_${String(i + 1).padStart(2, "0")}`;
    const plat = platforms[i % platforms.length];
    const pers = personas[i % personas.length];
    const prod = products[i % products.length];
    const postDate = new Date(2026, 8, Math.max(1, 20 - Math.floor(i / 2)), 9 + (i % 12), (i * 11) % 60);

    const dist = await prisma.distribution.upsert({
      where: { id: distId },
      update: {
        platformId: plat.id,
        personaId: pers.id,
        distributionType: i % 3 === 0 ? "post" : "comment",
        postUrl: `${plat.url}/posts/${distId}`,
        postedAt: postDate,
        status: i === 3 ? "pending_approval" : "posted",
        campaign: prod.campaign,
        notes: `Sebar link racun Shopee untuk ${prod.productName} di ${plat.name}.`,
      },
      create: {
        id: distId,
        platformId: plat.id,
        personaId: pers.id,
        distributionType: i % 3 === 0 ? "post" : "comment",
        postUrl: `${plat.url}/posts/${distId}`,
        postedAt: postDate,
        status: i === 3 ? "pending_approval" : "posted",
        campaign: prod.campaign,
        notes: `Sebar link racun Shopee untuk ${prod.productName} di ${plat.name}.`,
      },
    });

    // Link item
    await prisma.distributionItem.upsert({
      where: {
        distributionId_productId: {
          distributionId: dist.id,
          productId: prod.id,
        },
      },
      update: {},
      create: {
        distributionId: dist.id,
        productId: prod.id,
      },
    });

    // Engagement
    const engId = `eng_real_${String(i + 1).padStart(2, "0")}`;
    const views = 300 + (i * 140) % 2500;
    const clicks = 25 + (i * 22) % 350;
    const orders = Math.max(1, Math.floor(clicks * 0.08));

    await prisma.distributionEngagement.upsert({
      where: { id: engId },
      update: {
        viewsCount: views,
        clicksCount: clicks,
        ordersCount: orders,
        likesCount: Math.round(views * 0.05),
        sharesCount: Math.round(views * 0.02),
        capturedAt: new Date(postDate.getTime() + 12 * 3600 * 1000),
      },
      create: {
        id: engId,
        distributionId: dist.id,
        viewsCount: views,
        clicksCount: clicks,
        ordersCount: orders,
        likesCount: Math.round(views * 0.05),
        sharesCount: Math.round(views * 0.02),
        capturedAt: new Date(postDate.getTime() + 12 * 3600 * 1000),
      },
    });
  }

  // 6. SCHEDULES (Past missed schedules + 5 schedules per day from Sept 21 to Sept 30)
  console.log("📅 Generating schedules (past missed + 5 per day from Sept 21 - Sept 30)...");

  // A. Past schedules (Sept 18, 19, 20) -> Some "missed", some "posted"
  const pastDays = [18, 19, 20];
  let pastSchedCounter = 1;
  for (const day of pastDays) {
    for (let slot = 0; slot < 3; slot++) {
      const sId = `sched_past_${pastSchedCounter}`;
      const pers = personas[(day + slot) % personas.length];
      const prod = products[(day * slot) % products.length];
      const plat = platforms[(slot * 2) % platforms.length];
      const hours = slot === 0 ? 9 : slot === 1 ? 14 : 19;
      const schedTime = new Date(2026, 8, day, hours, 30);
      const isMissed = slot !== 1; // 2 missed, 1 posted

      await prisma.schedule.upsert({
        where: { id: sId },
        update: {
          title: `${pers.name} &bull; ${prod.productName} ke ${plat.name}`,
          personaId: pers.id,
          scheduleType: "one_time",
          scheduledAt: schedTime,
          status: isMissed ? "missed" : "posted",
          notes: JSON.stringify({
            platformId: plat.id,
            platformName: plat.name,
            productId: prod.id,
            productName: prod.productName,
            campaign: prod.campaign,
            customNotes: isMissed ? "Jadwal terlewat otomatis karena waktu posting telah berlalu." : "Berhasil diposting tepat waktu.",
          }),
        },
        create: {
          id: sId,
          title: `${pers.name} &bull; ${prod.productName} ke ${plat.name}`,
          personaId: pers.id,
          scheduleType: "one_time",
          scheduledAt: schedTime,
          status: isMissed ? "missed" : "posted",
          notes: JSON.stringify({
            platformId: plat.id,
            platformName: plat.name,
            productId: prod.id,
            productName: prod.productName,
            campaign: prod.campaign,
            customNotes: isMissed ? "Jadwal terlewat otomatis karena waktu posting telah berlalu." : "Berhasil diposting tepat waktu.",
          }),
        },
      });
      pastSchedCounter++;
    }
  }

  // B. Exactly 5 schedules per day from Sept 21 to Sept 30 (10 days * 5 = 50 schedules)
  // Each day has 5 schedules with DIFFERENT personas and VARIED statuses
  const scheduleTimes = [
    { hour: 6, minute: 30 },
    { hour: 9, minute: 15 },
    { hour: 12, minute: 30 },
    { hour: 17, minute: 45 },
    { hour: 19, minute: 30 },
  ];

  const possibleStatuses = ["scheduled", "reminded", "posted", "missed"];

  for (let day = 21; day <= 30; day++) {
    // 5 personas for the 5 slots of this day
    const dayPersonas = [bagas, naya, dimas, aurel, personas[(day % personas.length)]];

    for (let slot = 0; slot < 5; slot++) {
      const sId = `sched_d${day}_slot${slot + 1}`;
      const pers = dayPersonas[slot];
      const prod = products[(day * 3 + slot) % products.length];
      const plat = platforms[(day + slot * 2) % platforms.length];
      const timeSlot = scheduleTimes[slot];
      const schedTime = new Date(2026, 8, day, timeSlot.hour, timeSlot.minute);

      // Varied status based on day & slot
      let status = "scheduled";
      if (day === 21) {
        // Today's schedules: slot 0 already posted, slot 1 reminded, slot 2 scheduled, slot 3 reminded, slot 4 scheduled
        status = slot === 0 ? "posted" : slot === 1 || slot === 3 ? "reminded" : "scheduled";
      } else if (day === 22) {
        status = slot === 0 ? "reminded" : slot === 2 ? "posted" : "scheduled";
      } else if (day === 25) {
        status = slot === 4 ? "missed" : slot === 1 ? "posted" : "scheduled";
      } else {
        status = slot === 1 && day % 2 === 0 ? "reminded" : "scheduled";
      }

      const scheduleType = slot === 1 || slot === 4 ? "recurring" : "one_time";
      const recurrenceRule = scheduleType === "recurring" ? (slot === 1 ? "weekly:tue,thu" : "daily") : null;

      await prisma.schedule.upsert({
        where: { id: sId },
        update: {
          title: `${pers.name} &bull; ${prod.productName} ke ${plat.name}`,
          personaId: pers.id,
          scheduleType,
          recurrenceRule,
          scheduledAt: schedTime,
          status,
          notes: JSON.stringify({
            platformId: plat.id,
            platformName: plat.name,
            productId: prod.id,
            productName: prod.productName,
            campaign: prod.campaign,
            customNotes: `Slot posting ${timeSlot.hour}:${String(timeSlot.minute).padStart(2, "0")} WIB (${pers.name} di ${plat.name}).`,
          }),
        },
        create: {
          id: sId,
          title: `${pers.name} &bull; ${prod.productName} ke ${plat.name}`,
          personaId: pers.id,
          scheduleType,
          recurrenceRule,
          scheduledAt: schedTime,
          status,
          notes: JSON.stringify({
            platformId: plat.id,
            platformName: plat.name,
            productId: prod.id,
            productName: prod.productName,
            campaign: prod.campaign,
            customNotes: `Slot posting ${timeSlot.hour}:${String(timeSlot.minute).padStart(2, "0")} WIB (${pers.name} di ${plat.name}).`,
          }),
        },
      });
    }
  }

  console.log("✅ All realistic Phase 3 data seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
