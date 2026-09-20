import { getCurrentUser } from "@/lib/dal";
import { DashboardHeader } from "@/components/dashboard-header";
import { prisma } from "@/lib/prisma";
import { PostingHeatmap } from "@/components/best-time/posting-heatmap";
import { PersonaRecommendations } from "@/components/best-time/persona-recommendations";
import { PlatformNicheGuide } from "@/components/best-time/platform-niche-guide";
import { Clock, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Best Posting Time — AFM Tracker",
  description: "Analisis riset waktu posting terbaik untuk Facebook Groups, Instagram Reels, TikTok, dan Shopee Video",
};

export default async function BestPostingTimePage() {
  const user = await getCurrentUser();

  const personasRaw = await prisma.persona.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      niches: true,
    },
    orderBy: { name: "asc" },
  });

  const personas = personasRaw.map((p) => {
    let niches: string[] = [];
    try {
      if (Array.isArray(p.niches)) {
        niches = p.niches as string[];
      }
    } catch {
      niches = [];
    }
    return {
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      niches,
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Modul 6b &bull; Research-Based Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-primary" />
              Best Posting Time
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panduan berbasis riset empiris untuk menentukan jam dan hari posting dengan tingkat impresi, klik, dan konversi affiliate tertinggi.
            </p>
          </div>

          <Link href="/schedule">
            <Button className="gap-2 shadow-sm font-semibold self-start sm:self-auto">
              <Calendar className="w-4 h-4" />
              Buka Jadwal Posting
            </Button>
          </Link>
        </div>

        {/* 1. Heatmap Visual (Zona Emas) */}
        <PostingHeatmap />

        {/* 2. Persona-specific Recommendations */}
        <PersonaRecommendations personas={personas} />

        {/* 3. Platform & Niche Comprehensive Guide */}
        <PlatformNicheGuide />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &copy; {new Date().getFullYear()} &bull; Best Posting Time Research Engine
      </footer>
    </div>
  );
}
