import { getCurrentUser } from "@/lib/dal";
import { getProducts, getProductCategories } from "@/app/actions/products";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProductTable } from "@/components/products/product-table";
import { Package, TrendingUp, CheckCircle2, Share2 } from "lucide-react";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ]);

  // Statistics calculation
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const avgCommission =
    totalProducts > 0
      ? (
          products.reduce((acc, p) => acc + p.commissionRate, 0) /
          totalProducts
        ).toFixed(1)
      : "0";
  const totalDistributions = products.reduce(
    (acc, p) => acc + p.distributionsCount,
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Package className="w-6 h-6 text-primary" />
              Master Data Produk
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Kelola katalog produk Shopee Affiliate, komisi, dan tracking link promosi Anda.
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Produk</span>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-foreground">
              {totalProducts}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Produk terdaftar</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Produk Aktif</span>
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              {activeProducts}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Siap disebar</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Rata-rata Komisi</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">
              {avgCommission}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Potensi margin per order</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Sebaran</span>
              <Share2 className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              {totalDistributions}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Post & komentar grup</p>
          </div>
        </div>

        {/* Product Table with search, category filtering & modals */}
        <ProductTable products={products} categories={categories} />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Master Data Produk Shopee Affiliate
      </footer>
    </div>
  );
}
