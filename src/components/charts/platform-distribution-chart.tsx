"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe2 } from "lucide-react";

interface PlatformData {
  name: string;
  count: number;
  color: string;
}

interface PlatformDistributionChartProps {
  data: PlatformData[];
}

export function PlatformDistributionChart({
  data,
}: PlatformDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <Globe2 className="w-4 h-4 text-primary" />
          Distribusi per Platform
        </CardTitle>
        <CardDescription className="text-xs">
          Proporsi sebaran link affiliate di berbagai channel sosial media
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {total === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-xs text-muted-foreground">
            Belum ada data distribusi platform.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [
                      `${Number(value)} sebaran`,
                      "Jumlah",
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-foreground">
                  {total}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Sebaran
                </span>
              </div>
            </div>

            <div className="w-full sm:w-1/2 space-y-2">
              {data.map((item) => {
                const percentage =
                  total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">
                        {item.count}
                      </span>
                      <span className="font-bold text-foreground w-9 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
