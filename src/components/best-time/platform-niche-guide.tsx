"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_BEST_TIMES, NICHE_BEST_TIMES } from "@/lib/constants/best-posting-times";
import { Globe2, Sparkles, CheckCircle2, Lightbulb, Clock, CalendarDays } from "lucide-react";

export function PlatformNicheGuide() {
  const [activeTab, setActiveTab] = useState<"platform" | "niche">("platform");

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="w-5 h-5" />
              </span>
              <CardTitle className="text-lg font-bold text-foreground">
                Panduan Lengkap Waktu & Strategi Posting
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Riset mendalam berdasarkan pola konsumsi konten affiliate audiens Indonesia
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("platform")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "platform"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Berdasarkan Platform
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("niche")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "niche"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Berdasarkan Kategori / Niche
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === "platform" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(PLATFORM_BEST_TIMES).map((platform) => (
              <div
                key={platform.platformType}
                className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-primary" />
                      {platform.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {platform.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold">
                    {platform.bestDays.length} Hari Utama
                  </Badge>
                </div>

                {/* Slots */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Jadwal Waktu Emas:
                  </span>
                  <div className="space-y-1.5">
                    {platform.slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs gap-3"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {slot.day}
                            </span>
                            <span className="text-primary font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {slot.timeRange}
                            </span>
                          </div>
                          {slot.notes && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {slot.notes}
                            </p>
                          )}
                        </div>

                        <Badge
                          className={`text-[10px] py-0 px-2 shrink-0 ${
                            slot.engagementLevel === "peak"
                              ? "bg-amber-500 text-white"
                              : slot.engagementLevel === "high"
                              ? "bg-emerald-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {slot.engagementLevel === "peak"
                            ? "Tinggi (Peak)"
                            : slot.engagementLevel === "high"
                            ? "Tinggi"
                            : "Sedang"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Tips & Trik Khusus:
                  </span>
                  <ul className="space-y-1">
                    {platform.tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {NICHE_BEST_TIMES.map((niche) => (
              <div
                key={niche.niche}
                className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground">
                      {niche.niche}
                    </h3>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Peak Time:
                      </span>
                      <strong className="text-primary font-bold">
                        {niche.peakTime}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-secondary" /> Hari Terbaik:
                      </span>
                      <strong className="text-foreground">
                        {niche.bestDays.join(", ")}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {niche.notes}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <span className="text-[11px] font-bold text-foreground">
                    Rekomendasi Waktu Posting:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {niche.recommendedSlots.map((slot, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[11px] font-medium py-1 px-2.5"
                      >
                        {slot.day} &bull; {slot.time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
