import { getCurrentUser } from "@/lib/dal";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCampaignAnalytics } from "@/app/actions/campaigns";
import { CampaignListView } from "@/components/campaigns/campaign-list-view";
import { CampaignCharts } from "@/components/campaigns/campaign-charts";
import { Tag, Sparkles, ShoppingBag, Coins, Share2, Award } from "lucide-react";

export const metadata = {
  title: "Per-Campaign Reporting — AFM Tracker",
  description: "Laporan analitik performa distribusi dan konten video per campaign Shopee Affiliate",
};

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  const res = await getCampaignAnalytics();
  const campaigns = res.success ? res.data : [];

  const totalCampaigns = campaigns.length;
  const totalProductsInCampaigns = campaigns.reduce((acc, c) => acc + c.productCount, 0);
  const totalDistributionsInCampaigns = campaigns.reduce((acc, c) => acc + c.distributionCount, 0);
  const totalEarningsInCampaigns = campaigns.reduce((acc, c) => acc + c.estimatedEarnings, 0);
  const topCampaign = campaigns[0] || null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Section */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 3 &bull; Per-Campaign Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-primary" />
            Per-Campaign Reporting
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau dan ukur efektivitas setiap campaign promosi (misal: Promo 9.9, Gajian Sale, Ramadan) terhadap jumlah klik, order, dan komisi affiliate yang dihasilkan.
          </p>
        </div>

        {/* Aggregate KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Campaign
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground mt-3">
                {totalCampaigns}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Campaign aktif terdata
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Sebaran Campaign
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground mt-3">
                {totalDistributionsInCampaigns}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalProductsInCampaigns} produk terkait
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Est. Komisi
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
                Rp {Math.round(totalEarningsInCampaigns).toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dari seluruh campaign
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Top Performer
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground mt-3 truncate">
                {topCampaign ? topCampaign.name : "-"}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {topCampaign ? `Rp ${Math.round(topCampaign.estimatedEarnings).toLocaleString("id-ID")}` : "Belum ada"}
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Charts */}
        <CampaignCharts campaigns={campaigns} />

        {/* Campaign List View */}
        <CampaignListView campaigns={campaigns} />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &copy; {new Date().getFullYear()} &bull; Campaign Analytics Engine
      </footer>
    </div>
  );
}
