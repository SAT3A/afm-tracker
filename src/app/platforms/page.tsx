import { getCurrentUser } from "@/lib/dal";
import { getPlatforms, getPlatformCategories } from "@/app/actions/platforms";
import { DashboardHeader } from "@/components/dashboard-header";
import { PlatformTable } from "@/components/platforms/platform-table";
import { Globe } from "lucide-react";

export default async function PlatformsPage() {
  const user = await getCurrentUser();
  const [platforms, categories] = await Promise.all([
    getPlatforms(),
    getPlatformCategories(),
  ]);

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

        {/* Platforms Table (includes interactive KPI cards) */}
        <PlatformTable platforms={platforms} categories={categories} />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Master Data Platform & Grup Distribusi
      </footer>
    </div>
  );
}
