import { getCurrentUser } from "@/lib/dal";
import { getContent } from "@/app/actions/content";
import { getPersonas } from "@/app/actions/personas";
import { getProducts, getAllCampaigns } from "@/app/actions/products";
import { DashboardHeader } from "@/components/dashboard-header";
import { ContentTable } from "@/components/content/content-table";
import { Video, Eye, Film, Sparkles } from "lucide-react";

export default async function ContentPage() {
  const user = await getCurrentUser();
  const [contents, rawPersonas, rawProducts, campaigns] = await Promise.all([
    getContent(),
    getPersonas({ status: "active" }),
    getProducts({ status: "active" }),
    getAllCampaigns(),
  ]);

  const personas = rawPersonas.map((p) => ({
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
  }));

  const products = rawProducts.map((p) => ({
    id: p.id,
    productName: p.productName,
    brand: p.brand,
    price: p.price,
    commissionRate: p.commissionRate,
  }));

  // KPI Calculations
  const totalVideos = contents.length;
  const shopeeVideoCount = contents.filter(
    (c) => c.contentType === "shopee_video"
  ).length;
  const reelsCount = contents.filter(
    (c) => c.contentType === "fb_reels" || c.contentType === "ig_reels"
  ).length;
  const totalViews = contents.reduce(
    (acc, c) => acc + (c.latestMetric?.viewsCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Video className="w-6 h-6 text-primary" />
              Tracking Konten Video AI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Pantau postingan video AI di Shopee Video, Facebook Reels, Instagram Reels & TikTok, catat metrik views, likes, dan konversi klik affiliate.
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Konten Video
              </span>
              <Video className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-foreground">
              {totalVideos}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Video terpublikasi & draft
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Shopee Video
              </span>
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-orange-500">
              {shopeeVideoCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Konten di Shopee Video
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                FB & IG Reels
              </span>
              <Film className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-pink-500">
              {reelsCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Shorts / Reels media sosial
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Views Terpantau
              </span>
              <Eye className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-500">
              {totalViews.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Akumulasi tayangan video
            </p>
          </div>
        </div>

        {/* Content Table */}
        <ContentTable
          contents={contents}
          personas={personas}
          products={products}
          campaigns={campaigns}
        />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Video Content & Performance Tracking
      </footer>
    </div>
  );
}
