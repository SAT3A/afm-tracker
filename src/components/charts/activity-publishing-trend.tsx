"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Share2, Video, Calendar } from "lucide-react";

export interface ActivityTrendItem {
  date: string; // e.g. "14 Sep"
  fullDate: string;
  distributions: number;
  contents: number;
}

interface ActivityPublishingTrendProps {
  data: ActivityTrendItem[];
}

export function ActivityPublishingTrend({ data }: ActivityPublishingTrendProps) {
  const totalDists = data.reduce((sum, d) => sum + d.distributions, 0);
  const totalContents = data.reduce((sum, d) => sum + d.contents, 0);

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tren Aktivitas Publikasi (14 Hari Terakhir)
            </CardTitle>
            <CardDescription className="text-xs">
              Memantau konsistensi sebar link (Distributions) dan unggahan konten video AI (Content)
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              <Share2 className="w-3.5 h-3.5" /> {totalDists} Sebaran
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-pink-500">
              <Video className="w-3.5 h-3.5" /> {totalContents} Video
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDists" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" allowDecimals={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ActivityTrendItem;
                    return (
                      <div className="bg-popover border border-border p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-bold text-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {item.fullDate}
                        </p>
                        <p className="text-primary font-semibold flex items-center gap-1.5">
                          <Share2 className="w-3 h-3" /> Sebaran Link: {item.distributions} post
                        </p>
                        <p className="text-pink-500 font-semibold flex items-center gap-1.5">
                          <Video className="w-3 h-3" /> Video AI: {item.contents} video
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Area
                type="monotone"
                dataKey="distributions"
                name="Sebaran Link (Distributions)"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDists)"
              />
              <Area
                type="monotone"
                dataKey="contents"
                name="Konten Video AI"
                stroke="#EC4899"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorContents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
