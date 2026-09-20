"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHeatmapData, PLATFORM_BEST_TIMES } from "@/lib/constants/best-posting-times";
import { Sparkles, Flame, Clock, Info } from "lucide-react";

const platforms = [
  { id: "facebook", label: "Facebook Groups" },
  { id: "instagram", label: "Instagram Reels" },
  { id: "tiktok", label: "TikTok & Shopee Video" },
  { id: "threads", label: "Threads" },
];

export function PostingHeatmap() {
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const heatmapData = getHeatmapData(selectedPlatform);
  const platformInfo = PLATFORM_BEST_TIMES[selectedPlatform];

  // Helper for color intensity
  const getCellColor = (score: number) => {
    if (score >= 9) return "bg-amber-500 text-white font-bold shadow-xs hover:ring-2 hover:ring-amber-400";
    if (score >= 7) return "bg-emerald-500/90 text-white font-semibold hover:ring-2 hover:ring-emerald-400";
    if (score >= 5) return "bg-blue-500/80 text-white hover:ring-2 hover:ring-blue-400";
    if (score >= 3) return "bg-blue-400/30 text-foreground dark:text-blue-200 hover:ring-1 hover:ring-border";
    return "bg-muted/40 text-muted-foreground/50 hover:bg-muted";
  };

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="w-5 h-5" />
              </span>
              <CardTitle className="text-lg font-bold text-foreground">
                Heatmap 24/7 &mdash; Zona Emas Posting
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Visualisasi riset waktu terbaik posting berdasarkan analisis interaksi audiens Indonesia
            </CardDescription>
          </div>

          {/* Platform Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPlatform === p.id
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Platform Highlight Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-muted/50 border border-border text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>{platformInfo.name}:</strong> {platformInfo.description}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground">Hari Terbaik:</span>
            <span className="font-semibold text-primary">
              {platformInfo.bestDays.join(", ")}
            </span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            {/* Hour Header (00 - 23) */}
            <div className="grid grid-cols-[70px_repeat(24,1fr)] gap-1 mb-1.5 text-center text-[10px] font-mono text-muted-foreground">
              <div className="text-left font-sans pl-1 font-semibold">Hari</div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="truncate">
                  {String(i).padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Day Rows */}
            <div className="space-y-1.5">
              {heatmapData.map((row) => (
                <div
                  key={row.dayName}
                  className="grid grid-cols-[70px_repeat(24,1fr)] gap-1 items-center"
                >
                  <div className="text-xs font-semibold text-foreground truncate pl-1">
                    {row.dayName}
                  </div>
                  {row.hours.map((h) => (
                    <div
                      key={h.hour}
                      className={`h-7 rounded-sm flex items-center justify-center text-[9px] transition-transform cursor-pointer relative group ${getCellColor(
                        h.score
                      )}`}
                    >
                      {h.score >= 9 ? "★" : ""}
                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                        <div className="bg-popover border border-border text-popover-foreground text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap space-y-0.5">
                          <p className="font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            {row.dayName}, {String(h.hour).padStart(2, "0")}:00 -{" "}
                            {String(h.hour + 1).padStart(2, "0")}:00
                          </p>
                          <p className="text-muted-foreground text-[10px]">{h.label}</p>
                          {h.score >= 8 && (
                            <p className="text-amber-500 font-semibold text-[10px] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Sangat disarankan untuk posting!
                            </p>
                          )}
                        </div>
                        <div className="w-2 h-2 bg-popover border-b border-r border-border rotate-45 -mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-muted-foreground font-medium">Tingkat Potensi:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-amber-500" />
              <span className="text-[11px] font-semibold text-foreground">Zona Emas (Peak ★)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-emerald-500" />
              <span className="text-[11px] text-muted-foreground">Tinggi (High)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-blue-500/80" />
              <span className="text-[11px] text-muted-foreground">Sedang (Lunch/Evening)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-muted border border-border" />
              <span className="text-[11px] text-muted-foreground">Normal / Off-Peak</span>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground italic">
            *Arahkan kursor pada kotak waktu untuk melihat rincian jam
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
