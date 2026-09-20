import { getCurrentUser } from "@/lib/dal";
import { getDistributions } from "@/app/actions/distributions";
import { getProducts, getAllCampaigns } from "@/app/actions/products";
import { getPlatforms } from "@/app/actions/platforms";
import { getPersonas } from "@/app/actions/personas";
import { DashboardHeader } from "@/components/dashboard-header";
import { DistributionTable } from "@/components/distributions/distribution-table";
import { Share2, Clock, CheckCircle2, Package } from "lucide-react";

export default async function DistributionsPage() {
  const user = await getCurrentUser();
  const [distributions, rawProducts, rawPlatforms, rawPersonas, campaigns] =
    await Promise.all([
      getDistributions(),
      getProducts({ status: "active" }),
      getPlatforms({ status: "active" }),
      getPersonas({ status: "active" }),
      getAllCampaigns(),
    ]);

  // Map to simple options for modals
  const products = rawProducts.map((p) => ({
    id: p.id,
    productName: p.productName,
    brand: p.brand,
    price: p.price,
    commissionRate: p.commissionRate,
  }));

  const platforms = rawPlatforms.map((pl) => ({
    id: pl.id,
    name: pl.name,
    platformType: pl.platformType,
    category: pl.category,
    requiresApproval: pl.requiresApproval,
  }));

  const personas = rawPersonas.map((pe) => ({
    id: pe.id,
    name: pe.name,
    avatarUrl: pe.avatarUrl,
  }));

  // Statistics calculation
  const totalDistributions = distributions.length;
  const pendingApprovalCount = distributions.filter(
    (d) => d.status === "pending_approval"
  ).length;
  const approvedCount = distributions.filter(
    (d) => d.status === "approved" || d.status === "posted"
  ).length;
  const totalProductsCovered = new Set(
    distributions.flatMap((d) => d.items.map((i) => i.product.id))
  ).size;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Share2 className="w-6 h-6 text-primary" />
              Tracking Distribusi & Sebar Link
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Catat aktivitas sebar link Shopee Affiliate ke grup Facebook & medsos, pantau status approval, dan distribusikan batch link.
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Sebaran Link
              </span>
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-foreground">
              {totalDistributions}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Postingan & komentar
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Pending Approval
              </span>
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-accent">
              {pendingApprovalCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Menunggu review admin grup
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Tayang / Disetujui
              </span>
              <CheckCircle2 className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-secondary">
              {approvedCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Aktif terlihat audiens
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Produk Terdiversifikasi
              </span>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-primary">
              {totalProductsCovered}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Variasi produk yang telah disebar
            </p>
          </div>
        </div>

        {/* Distributions Table */}
        <DistributionTable
          distributions={distributions}
          products={products}
          platforms={platforms}
          personas={personas}
          campaigns={campaigns}
        />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Tracking Sebar Link Affiliate
      </footer>
    </div>
  );
}
