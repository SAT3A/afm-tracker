import { getCurrentUser } from "@/lib/dal";
import { getPersonas } from "@/app/actions/personas";
import { DashboardHeader } from "@/components/dashboard-header";
import { PersonaCardGrid } from "@/components/personas/persona-card-grid";
import { Users2, CheckCircle2, Video, Share2 } from "lucide-react";

export default async function PersonasPage() {
  const user = await getCurrentUser();
  const personas = await getPersonas();

  // Statistics calculation
  const totalPersonas = personas.length;
  const activePersonas = personas.filter((p) => p.status === "active").length;
  const totalContents = personas.reduce((acc, p) => acc + p.contentsCount, 0);
  const totalDistributions = personas.reduce(
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
              <Users2 className="w-6 h-6 text-primary" />
              Master Data Persona AI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Kelola persona AI (Bagas, Naya, dan persona baru), niche target, akun medsos, dan tracking performanya.
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Persona
              </span>
              <Users2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-foreground">
              {totalPersonas}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Persona terdaftar
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Persona Aktif
              </span>
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              {activePersonas}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Siap memproduksi konten
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Konten AI
              </span>
              <Video className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              {totalContents}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Video yang diproduksi
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
              Distribusi oleh persona
            </p>
          </div>
        </div>

        {/* Persona Card Grid with Search & Filters */}
        <PersonaCardGrid personas={personas} />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Master Data Persona AI
      </footer>
    </div>
  );
}
