"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Eye, MousePointerClick, ShoppingBag, Coins, Heart, MessageSquare, Share2, Bookmark, Info } from "lucide-react";
import { formatCompactNumber, formatCurrencyIDR, formatPercentage } from "@/lib/analytics/metrics";

interface AffiliateFunnelCardProps {
  data: {
    views: number;
    videoViews: number;
    postImpressions: number;
    clicks: number;
    orders: number;
    commission: number;
    epc: number;
    ctr: number;
    cvr: number;
    engagements: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      total: number;
      rate: number;
    };
  };
}

export function AffiliateFunnelCard({ data }: AffiliateFunnelCardProps) {
  const avgCommissionPerOrder = data.orders > 0 ? Math.round(data.commission / data.orders) : 0;

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Filter className="w-4 h-4 text-primary" />
              Funnel Konversi Komersial Affiliate
            </CardTitle>
            <CardDescription className="text-xs">
              Alur konversi dari impresi/views menjadi klik dan pesanan Shopee, dengan interaksi sosial paralel.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/80 self-start sm:self-auto">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Drop-off antar tahapan dihitung transparan</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-1">
        {/* Primary Commercial Funnel Horizontal Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Stage 1: Views / Impressions */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                1. Jangkauan
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border">
                Mixed Basis
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {formatCompactNumber(data.views)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatCompactNumber(data.videoViews)} Views &bull; {formatCompactNumber(data.postImpressions)} Impresi
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground/90 border-t border-border/60 pt-1.5">
              100% Volume Audiens Terjangkau
            </div>
          </div>

          {/* Stage 2: Clicks */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-primary" />
                2. Klik Affiliate
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                CTR: {formatPercentage(data.ctr)}
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {formatCompactNumber(data.clicks)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Traffic dialihkan ke Shopee
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground/90 border-t border-border/60 pt-1.5">
              Rasio Konversi Jangkauan &rarr; Klik
            </div>
          </div>

          {/* Stage 3: Orders */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-500" />
                3. Checkout Order
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                CVR: {formatPercentage(data.cvr)}
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {data.orders.toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pesanan sukses terkonversi
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground/90 border-t border-border/60 pt-1.5">
              Rasio Konversi Klik &rarr; Pesanan
            </div>
          </div>

          {/* Stage 4: Commission */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-500" />
                4. Estimasi Komisi
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                EPC: Rp {data.epc.toLocaleString("id-ID")}
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyIDR(data.commission, true)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Rata-rata: Rp {avgCommissionPerOrder.toLocaleString("id-ID")} / order
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground/90 border-t border-border/60 pt-1.5">
              Hasil Finansial Akhir
            </div>
          </div>
        </div>

        {/* Parallel Interaction Bar (Resonansi Sosial) */}
        <div className="p-4 rounded-xl border border-dashed border-border bg-card/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-foreground">
                Resonansi Sosial Paralel (Engagement Metric)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
                ER: {formatPercentage(data.engagements.rate)}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Total {formatCompactNumber(data.engagements.total)} Interaksi Terpantau
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-muted-foreground">Likes:</span>
              <strong className="text-foreground ml-auto">{formatCompactNumber(data.engagements.likes)}</strong>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-muted-foreground">Komentar:</span>
              <strong className="text-foreground ml-auto">{formatCompactNumber(data.engagements.comments)}</strong>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60">
              <Share2 className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-muted-foreground">Share:</span>
              <strong className="text-foreground ml-auto">{formatCompactNumber(data.engagements.shares)}</strong>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-muted-foreground">Saves:</span>
              <strong className="text-foreground ml-auto">{formatCompactNumber(data.engagements.saves)}</strong>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
