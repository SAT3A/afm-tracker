import { getCurrentUser } from "@/lib/dal";
import { DashboardHeader } from "@/components/dashboard-header";
import { prisma } from "@/lib/prisma";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { Calendar, Sparkles } from "lucide-react";

export const metadata = {
  title: "Posting Schedule & Reminder — AFM Tracker",
  description: "Kelola kalender jadwal posting affiliate dan pengingat notifikasi browser otomatis",
};

export default async function SchedulePage() {
  const user = await getCurrentUser();

  const [schedulesRaw, personasRaw, platformsRaw, productsRaw] = await Promise.all([
    prisma.schedule.findMany({
      orderBy: { scheduledAt: "asc" },
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.persona.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        niches: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.platform.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        platformType: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { status: "active" },
      select: {
        id: true,
        productName: true,
        brand: true,
      },
      orderBy: { productName: "asc" },
    }),
  ]);

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
      niches,
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title Section */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Modul 6c &bull; Posting Schedule & Reminder
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-secondary" />
            Jadwal & Pengingat Posting
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rencanakan jadwal sebar link affiliate dan publikasi konten video AI dengan dukungan kalender visual dan alarm notifikasi browser otomatis.
          </p>
        </div>

        {/* Schedule Main View */}
        <ScheduleView
          schedules={schedulesRaw}
          personas={personas}
          platforms={platformsRaw}
          products={productsRaw}
        />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AFM Tracker &copy; {new Date().getFullYear()} &bull; Posting Schedule & Reminder System
      </footer>
    </div>
  );
}
