"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignSummary } from "@/app/actions/campaigns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, BarChart3, PieChart, Sparkles } from "lucide-react";

interface CampaignChartsProps {
  campaigns: CampaignSummary[];
}

export function CampaignCharts({ campaigns }: CampaignChartsProps) {
  if (campaigns.length === 0) return null;

  // Prepare data for Chart 1: Revenue & Orders Comparison
  const revenueData = campaigns.slice(0, 8).map((c) => ({
    name: c.name.length > 15 ? `${c.name.slice(0, 13)}...` : c.name,
    fullName: c.name,
    komisi: Math.round(c.estimatedEarnings),
    orders: c.totalOrders,
  }));

  // Prepare data for Chart 2: Views vs Clicks Funnel
  const engagementData = campaigns.slice(0, 8).map((c) => ({
    name: c.name.length > 15 ? `${c.name.slice(0, 13)}...` : c.name,
    fullName: c.name,
    views: c.totalViews,
    clicks: c.totalClicks,
  }));

  // Prepare data for Chart 3: Channel Breakdown (Distributions vs Content)
  const channelData = campaigns.slice(0, 8).map((c) => ({
    name: c.name.length > 15 ? `${c.name.slice(0, 13)}...` : c.name,
    fullName: c.name,
    sebaranLink: c.distributionCount,
    videoAI: c.contentCount,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Komisi & Order per Campaign */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Estimasi Komisi & Order per Campaign
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbandingan performa penjualan affiliate antar campaign promosi
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold text-foreground">{data.fullName}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Est. Komisi: Rp {data.komisi.toLocaleString("id-ID")}
                            </p>
                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                              Pesanan: {data.orders} order
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="komisi"
                    name="Est. Komisi (Rp)"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    name="Total Order"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Views vs Clicks Funnel */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Jangkauan (Views) & Konversi Klik per Campaign
                </CardTitle>
                <CardDescription className="text-xs">
                  Mengukur ketertarikan audiens dari tayangan hingga klik tautan Shopee
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const ctr = data.views > 0 ? ((data.clicks / data.views) * 100).toFixed(1) : 0;
                        return (
                          <div className="bg-popover border border-border p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-bold text-foreground">{data.fullName}</p>
                            <p className="text-blue-500 font-medium">Views: {data.views.toLocaleString("id-ID")}</p>
                            <p className="text-teal-500 font-semibold">Klik: {data.clicks.toLocaleString("id-ID")}</p>
                            <p className="text-[10px] text-muted-foreground">CTR: {ctr}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Total Views"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="Total Klik"
                    stroke="#14B8A6"
                    fill="#14B8A6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Volume Channel (Sebaran vs Video) */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Distribusi Channel: Sebaran Link vs Konten Video AI
              </CardTitle>
              <CardDescription className="text-xs">
                Keseimbangan saluran promosi grup media sosial dengan video reels/Shopee video
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-foreground">{data.fullName}</p>
                          <p className="text-primary font-medium">Sebaran Link: {data.sebaranLink} post</p>
                          <p className="text-purple-500 font-medium">Video AI: {data.videoAI} video</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="sebaranLink" name="Sebaran Link (FB/IG/Threads)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="videoAI" name="Konten Video AI (Shopee/Reels/TikTok)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
