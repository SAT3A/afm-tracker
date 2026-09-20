"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users2, Video, Share2, Eye, MousePointerClick, ShoppingBag } from "lucide-react";
import Link from "next/link";

export interface PersonaPerformanceData {
  id: string;
  name: string;
  avatarUrl: string | null;
  niches: string[];
  distributionCount: number;
  contentCount: number;
  totalViews: number;
  totalClicks: number;
  totalOrders: number;
  estimatedEarnings: number;
}

interface PersonaComparisonProps {
  data: PersonaPerformanceData[];
}

export function PersonaComparison({ data }: PersonaComparisonProps) {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Users2 className="w-4 h-4 text-secondary" />
              Komparasi Kinerja Persona AI
            </CardTitle>
            <CardDescription className="text-xs">
              Perbandingan produktivitas sebaran link, konten video, views, dan estimasi earning antar persona
            </CardDescription>
          </div>
          <Link
            href="/personas"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Kelola Persona
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Belum ada data persona aktif.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-all space-y-3 shadow-xs"
              >
                {/* Persona Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary font-extrabold text-base flex items-center justify-center">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-foreground truncate">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {p.niches.length > 0 ? p.niches.join(", ") : "Multi-niche"}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
                      <Share2 className="w-3 h-3 text-primary" />
                      Sebaran
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {p.distributionCount}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
                      <Video className="w-3 h-3 text-pink-500" />
                      Video
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {p.contentCount}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
                      <Eye className="w-3 h-3 text-teal-500" />
                      Views
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {p.totalViews.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Clicks & Earning highlight */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {p.totalOrders} Orders &bull; {p.totalClicks} Clicks
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-300">
                    Rp {Math.round(p.estimatedEarnings).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
