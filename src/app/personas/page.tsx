import { getCurrentUser } from "@/lib/dal";
import { getPersonas } from "@/app/actions/personas";
import { DashboardHeader } from "@/components/dashboard-header";
import { PersonaCardGrid } from "@/components/personas/persona-card-grid";
import { Users2 } from "lucide-react";

export default async function PersonasPage() {
  const user = await getCurrentUser();
  const personas = await getPersonas();

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

        {/* Persona Card Grid with interactive KPI cards, Search & Filters */}
        <PersonaCardGrid personas={personas} />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &bull; Master Data Persona AI
      </footer>
    </div>
  );
}
