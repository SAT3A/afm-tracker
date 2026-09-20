"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NICHE_BEST_TIMES } from "@/lib/constants/best-posting-times";
import { Users2, Calendar, Sparkles, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

interface PersonaData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  niches: string[];
}

interface PersonaRecommendationsProps {
  personas: PersonaData[];
}

export function PersonaRecommendations({ personas }: PersonaRecommendationsProps) {
  if (personas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
            <Users2 className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-foreground">
            Rekomendasi Khusus Persona Anda
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sistem menganalisis niche masing-masing persona AI dan memetakan jadwal posting yang paling menghasilkan konversi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {personas.map((persona) => {
          // Match persona niches with research niche data
          const matchedNiches = NICHE_BEST_TIMES.filter((n) =>
            persona.niches.some((pNic) => {
              const clean = pNic.toLowerCase().trim();
              return (
                n.niche.toLowerCase().includes(clean) ||
                n.aliases.some((alias) => alias.includes(clean) || clean.includes(alias))
              );
            })
          );

          // If no specific niche matched, use default first two
          const displayedNiches = matchedNiches.length > 0 ? matchedNiches : NICHE_BEST_TIMES.slice(0, 2);

          return (
            <Card
              key={persona.id}
              className="border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20 shrink-0">
                      {persona.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {persona.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {persona.niches.map((n) => (
                          <Badge
                            key={n}
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 font-normal"
                          >
                            {n}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5 pt-0 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {displayedNiches.map((niche) => (
                    <div
                      key={niche.niche}
                      className="p-3 rounded-xl bg-muted/50 border border-border/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {niche.niche}
                        </span>
                        <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {niche.peakTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {niche.notes}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Slot Utama:
                        </span>
                        {niche.recommendedSlots.map((slot, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-medium text-foreground"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            {slot.day} ({slot.time})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Siap menjadwalkan?
                  </span>
                  <Link
                    href={`/schedule?personaId=${persona.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Bikin Jadwal <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
