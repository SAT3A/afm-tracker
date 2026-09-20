"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Layers, ShoppingBag, MousePointerClick } from "lucide-react";

export interface NichePerformanceItem {
  category: string;
  productCount: number;
  distributionCount: number;
  totalClicks: number;
  totalOrders: number;
  estimatedEarnings: number;
}

interface NichePerformanceChartProps {
  data: NichePerformanceItem[];
}

export function NichePerformanceChart({ data }: NichePerformanceChartProps) {
  const chartData = data.map((d) => ({
    name: d.category,
    komisi: Math.round(d.estimatedEarnings),
    clicks: d.totalClicks,
    orders: d.totalOrders,
    products: d.productCount,
    distributions: d.distributionCount,
  }));

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Layers className="w-4 h-4 text-secondary" />
              Performa Finansial per Kategori Produk
            </CardTitle>
            <CardDescription className="text-xs">
              Analisis estimasi komisi dan klik affiliate berdasarkan kategori / niche produk
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    const item = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-bold text-foreground">{item.name}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Est. Komisi: Rp {item.komisi.toLocaleString("id-ID")}
                        </p>
                        <p className="text-primary font-medium">
                          Total Klik: {item.clicks.toLocaleString("id-ID")}
                        </p>
                        <p className="text-amber-600 dark:text-amber-400 font-medium">
                          Pesanan: {item.orders} order
                        </p>
                        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                          {item.products} produk katalog &bull; {item.distributions} sebaran link
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
                dataKey="clicks"
                name="Total Klik"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
