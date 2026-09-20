"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Globe2, ShoppingBag, MousePointerClick, Share2 } from "lucide-react";
import Link from "next/link";

interface TopProductItem {
  id: string;
  productName: string;
  brand: string;
  price: number;
  commissionRate: number;
  distributionCount: number;
  totalOrders: number;
  totalClicks: number;
}

interface TopPlatformItem {
  id: string;
  name: string;
  platformType: string;
  distributionCount: number;
  totalViews: number;
  totalClicks: number;
}

interface TopPerformersProps {
  topProducts: TopProductItem[];
  topPlatforms: TopPlatformItem[];
}

export function TopPerformers({
  topProducts,
  topPlatforms,
}: TopPerformersProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Produk */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Package className="w-4 h-4 text-primary" />
                Top 5 Produk Affiliate
              </CardTitle>
              <CardDescription className="text-xs">
                Produk paling sering disebar & menghasilkan konversi klik
              </CardDescription>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Belum ada data produk disebar.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center shrink-0 text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {p.productName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.brand} &bull; Rp {p.price.toLocaleString("id-ID")}{" "}
                        <span className="text-secondary font-medium">
                          ({p.commissionRate}%)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="font-bold text-foreground flex items-center justify-end gap-1">
                        <Share2 className="w-3 h-3 text-primary" />
                        {p.distributionCount}x
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        sebaran
                      </div>
                    </div>
                    {p.totalOrders > 0 && (
                      <div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {p.totalOrders}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          orders
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Grup / Platforms */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Globe2 className="w-4 h-4 text-secondary" />
                Top 5 Grup / Channel Target
              </CardTitle>
              <CardDescription className="text-xs">
                Grup dengan frekuensi sebaran tertinggi & interaksi aktif
              </CardDescription>
            </div>
            <Link
              href="/platforms"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {topPlatforms.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Belum ada data sebaran grup.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topPlatforms.map((g, idx) => (
                <div
                  key={g.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-muted font-bold text-[10px] flex items-center justify-center shrink-0 text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {g.name}
                      </p>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-muted text-muted-foreground rounded">
                        {g.platformType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="font-bold text-foreground flex items-center justify-end gap-1">
                        <Share2 className="w-3 h-3 text-secondary" />
                        {g.distributionCount}x
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        sebaran
                      </div>
                    </div>
                    {g.totalClicks > 0 && (
                      <div>
                        <div className="font-bold text-primary flex items-center justify-end gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {g.totalClicks}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          clicks
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
