"use client";

import { Eye, MousePointerClick, ShoppingBag, Coins, ArrowRight, HeartHandshake, Info } from "lucide-react";
import { formatCompactNumber, formatCurrencyIDR, formatPercentage } from "@/lib/analytics/metrics";

interface BusinessOverviewProps {
  metrics: {
    totalViews: number;
    videoViews: number;
    postImpressions: number;
    totalEngagements: number;
    engagementRate: number;
    affiliateClicks: number;
    affiliateCTR: number;
    orders: number;
    conversionRate: number;
    commission: number;
    epc: number;
    totalProducts: number;
    activeProducts: number;
    totalDistributions: number;
    pendingDistributions: number;
    totalContents: number;
  };
}

export function BusinessOverview({ metrics }: BusinessOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Overview Arus Komersial Affiliate
          </h2>
          <p className="text-xs text-muted-foreground">
            Alur throughput komersial utama dari jangkauan audiens hingga estimasi komisi penjualan.
          </p>
        </div>
      </div>

      {/* Primary Commercial Funnel 4-Cards Grid with Transition Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1: Reach / Views & Impressions */}
        <div className="relative p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              1. Total Jangkauan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatCompactNumber(metrics.totalViews)}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border"
                title="Penyebut gabungan (Mixed Basis): Video Plays (Views) dan Tayangan Feed (Impressions)"
              >
                Mixed Basis
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatCompactNumber(metrics.videoViews)} Views &bull; {formatCompactNumber(metrics.postImpressions)} Impresi
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Basis Penayangan</span>
            <span className="font-semibold text-foreground">100% Top-of-Funnel</span>
          </div>

          {/* Connector Arrow on Desktop */}
          <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground z-10 shadow-xs">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Stage 2: Affiliate Clicks */}
        <div className="relative p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              2. Klik Affiliate
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatCompactNumber(metrics.affiliateClicks)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
                title="Affiliate CTR = Total Klik / Total Jangkauan × 100%"
              >
                CTR: {formatPercentage(metrics.affiliateCTR)}
              </span>
              <span className="text-[11px] text-muted-foreground">Traffic ke Shopee</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Rasio Klik (CTR)</span>
            <span className="font-semibold text-foreground">{formatPercentage(metrics.affiliateCTR)} dari jangkauan</span>
          </div>

          {/* Connector Arrow on Desktop */}
          <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground z-10 shadow-xs">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Stage 3: Orders */}
        <div className="relative p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              3. Pesanan Terpantau
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {metrics.orders.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                title="Conversion Rate (CVR) = Total Pesanan / Total Klik × 100%"
              >
                CVR: {formatPercentage(metrics.conversionRate)}
              </span>
              <span className="text-[11px] text-muted-foreground">Checkout Shopee</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Konversi Pesanan</span>
            <span className="font-semibold text-foreground">{formatPercentage(metrics.conversionRate)} dari klik</span>
          </div>

          {/* Connector Arrow on Desktop */}
          <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground z-10 shadow-xs">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Stage 4: Commission */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              4. Estimasi Komisi
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrencyIDR(metrics.commission, true)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                title="Earnings Per Click (EPC) = Total Komisi / Total Klik"
              >
                EPC: Rp {metrics.epc.toLocaleString("id-ID")}
              </span>
              <span className="text-[11px] text-muted-foreground">per klik</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Nilai Rata-rata Klik</span>
            <span className="font-semibold text-foreground">Rp {metrics.epc.toLocaleString("id-ID")} / klik</span>
          </div>
        </div>
      </div>

      {/* Parallel Resonance & Activity Summary Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Parallel Interaction Notice */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">
                Resonansi Sosial Paralel: {formatCompactNumber(metrics.totalEngagements)} Interaksi
              </span>
              <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-pink-500/10 text-pink-500 border border-pink-500/20">
                ER: {formatPercentage(metrics.engagementRate)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Info className="w-3 h-3 text-muted-foreground/70" />
              Interaksi sosial (likes/komentar) berjalan paralel, bukan tahapan wajib sebelum audiens mengklik link affiliate.
            </p>
          </div>
        </div>

        {/* Compact Activity Count Pills */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground">
            Produk: <strong className="text-foreground">{metrics.totalProducts}</strong> ({metrics.activeProducts} aktif)
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground">
            Sebaran: <strong className="text-foreground">{metrics.totalDistributions}</strong> ({metrics.pendingDistributions} pending)
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground">
            Video AI: <strong className="text-foreground">{metrics.totalContents}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
