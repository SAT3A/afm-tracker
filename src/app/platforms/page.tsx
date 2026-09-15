import { getCurrentUser } from "@/lib/dal";
import { getPlatforms, getPlatformCategories } from "@/app/actions/platforms";
import { DashboardHeader } from "@/components/dashboard-header";
import { PlatformTable } from "@/components/platforms/platform-table";
import { Globe, Users, ShieldAlert, Share2 } from "lucide-react";

export default async function PlatformsPage() {
  const user = await getCurrentUser();
  const [platforms, categories] = await Promise.all([
    getPlatforms(),
    getPlatformCategories(),
  ]);

  // Statistics calculation
  const totalPlatforms = platforms.length;
  const fbGroupsCount = platforms.filter(
    (p) => p.platformType === "facebook"
  ).length;
  const approvalCount = platforms.filter((p) => p.requiresApproval).length;
  const totalDistributions = platforms.reduce(
    (acc, p) => acc + p.distributionsCount,
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
              <Globe className="w-6 h-6 text-primary" />
              Master Data Platform & Grup
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Kelola grup Facebook, akun media sosial, channel distribusi, dan aturan sebar link affiliate.
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Platform
              </span>
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-foreground">
              {totalPlatforms}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Grup & channel terdaftar
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Grup Facebook
              </span>
              <Users className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              {fbGroupsCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Target sebar utama
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Butuh Approval
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">
              {approvalCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dimoderasi oleh admin
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Sebaran Link
              </span>
              <Share2 className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              {totalDistributions}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Postingan yang tercatat
            </p>
          </div>
        </div>

        {/* Platforms Table */}
        <PlatformTable platforms={platforms} categories={categories} />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Master Data Platform & Grup Distribusi
      </footer>
    </div>
  );
}
