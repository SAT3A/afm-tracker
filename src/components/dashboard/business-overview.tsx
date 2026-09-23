"use client";

import { Eye, MousePointerClick, ShoppingBag, Coins, ArrowRight, HeartHandshake, Info, Share2 } from "lucide-react";
import { formatCompactNumber, formatCurrencyIDR, formatPercentage } from "@/lib/analytics/metrics";
import type { MetricBasis } from "@/lib/analytics/config";
import type { SocialResonanceItem, DistributionResonanceItem } from "@/lib/analytics/aggregation";

interface BusinessOverviewProps {
  metrics: {
    totalViews: number;
    videoViews: number;
    postImpressions: number;
    reachBasis: MetricBasis;
    hasDistributionData: boolean;
    dataNotice?: string;
    contentEngagement: SocialResonanceItem;
    distributionEngagement: DistributionResonanceItem;
    totalEngagements?: number;
    engagementRate?: number | null;
    affiliateClicks: number;
    affiliateCTR: number | null;
    orders: number;
    conversionRate: number;
    commission: number;
    epc: number;
    totalProducts: number;
    activeProducts: number;
    totalDistributions: number;
    pendingDistributions: number;
    totalContents: number;
    canonicalCommercialSource?: "DistributionEngagement";
  };
}

export function BusinessOverview({ metrics }: BusinessOverviewProps) {
  const isMixed = metrics.reachBasis === "mixed";

  return (
    <div className="space-y-4">
      {/* Section Title & Attribution Source Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Overview Arus Komersial Affiliate
          </h2>
          <p className="text-xs text-muted-foreground">
            Throughput konversi komersial kanonik (tanpa double counting data lintas tabel).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-muted/80 text-muted-foreground border border-border"
            title="Sumber kanonik klik, pesanan, dan komisi utama pada Business Overview"
          >
            Kanonik: {metrics.canonicalCommercialSource || "DistributionEngagement"}
          </span>
        </div>
      </div>

      {/* Explanatory banner when no attributed distribution data exists */}
      {!metrics.hasDistributionData && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Belum ada data distribusi teratribusi.</p>
            <p className="text-[11px] text-muted-foreground">
              Metrik throughput komersial (Klik Affiliate, Pesanan, Komisi) pada Overview ini bersumber kanonik secara konsisten dari <code>DistributionEngagement</code>. Belum ada rekaman sebaran link yang cocok dengan filter aktif. (Catatan: Metrik kreatif konten tetap dapat dilihat pada tabel Performa Konten di bawah).
            </p>
          </div>
        </div>
      )}

      {/* Primary Commercial Funnel 4-Cards Grid with Transition Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1: Reach / Views & Impressions */}
        <div className="relative p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              1. Total Jangkauan Observasi
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
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  isMixed
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
                title={
                  isMixed
                    ? "Populasi gabungan Video Plays dan Impresi Feed (Mixed Basis)"
                    : `Basis penayangan homogen: ${metrics.reachBasis}`
                }
              >
                {isMixed ? "Mixed Basis" : metrics.reachBasis === "views" ? "Views Basis" : "Impressions Basis"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatCompactNumber(metrics.videoViews)} Views &bull; {formatCompactNumber(metrics.postImpressions)} Impresi
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Basis Jangkauan</span>
            <span className="font-semibold text-foreground">
              {isMixed ? "Agregat Observasi" : "100% Homogen"}
            </span>
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
              {metrics.hasDistributionData ? formatCompactNumber(metrics.affiliateClicks) : "0"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
                title={
                  !metrics.hasDistributionData
                    ? "Belum ada data sebaran teratribusi"
                    : isMixed
                    ? "CTR tidak dihitung agregat universal karena denominator mencampur Views dan Impresi"
                    : "Affiliate CTR = Total Klik / Total Jangkauan × 100%"
                }
              >
                CTR: {!metrics.hasDistributionData ? "N/A" : isMixed ? "N/A (Mixed Basis)" : formatPercentage(metrics.affiliateCTR)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {metrics.hasDistributionData ? "Traffic Shopee" : "Belum ada sebaran"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Rasio Klik (CTR)</span>
            <span className="font-semibold text-foreground">
              {!metrics.hasDistributionData
                ? "N/A (Data sebaran kosong)"
                : isMixed
                ? "Per platform di tabel"
                : `${formatPercentage(metrics.affiliateCTR)} dari jangkauan`}
            </span>
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
              {metrics.hasDistributionData ? metrics.orders.toLocaleString("id-ID") : "0"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                title="Conversion Rate (CVR) = Total Pesanan / Total Klik × 100%"
              >
                CVR: {!metrics.hasDistributionData ? "N/A" : formatPercentage(metrics.conversionRate)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {metrics.hasDistributionData ? "Checkout Shopee" : "Belum ada sebaran"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Konversi Pesanan</span>
            <span className="font-semibold text-foreground">
              {!metrics.hasDistributionData ? "N/A" : `${formatPercentage(metrics.conversionRate)} dari klik`}
            </span>
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
              4. Komisi Terpantau
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {metrics.hasDistributionData ? formatCurrencyIDR(metrics.commission, true) : "Rp 0"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                title="Earnings Per Click (EPC) = Total Komisi / Total Klik"
              >
                EPC: {!metrics.hasDistributionData ? "N/A" : `Rp ${metrics.epc.toLocaleString("id-ID")}`}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {metrics.hasDistributionData ? "per klik" : "Belum ada sebaran"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Nilai Rata-rata Klik</span>
            <span className="font-semibold text-foreground">
              {!metrics.hasDistributionData ? "N/A" : `Rp ${metrics.epc.toLocaleString("id-ID")} / klik`}
            </span>
          </div>
        </div>
      </div>

      {/* Parallel Social Resonance (Option A: Separated without blind summing) */}
      <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Content Engagement Block */}
          <div className="flex items-center gap-3 pr-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground">
                  Resonansi Konten: {formatCompactNumber(metrics.contentEngagement?.total ?? metrics.totalEngagements ?? 0)}
                </span>
                <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  ER Konten: {formatPercentage(metrics.contentEngagement?.rate ?? metrics.engagementRate)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatCompactNumber(metrics.contentEngagement?.likes ?? 0)} Likes &bull; {formatCompactNumber(metrics.contentEngagement?.comments ?? 0)} Komentar &bull; {formatCompactNumber(metrics.contentEngagement?.shares ?? 0)} Shares &bull; {formatCompactNumber(metrics.contentEngagement?.saves ?? 0)} Saves
              </p>
            </div>
          </div>

          {/* Distribution Engagement Block */}
          <div className="flex items-center gap-3 sm:pl-4 pt-2 sm:pt-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground">
                  Resonansi Sebaran: {formatCompactNumber(metrics.distributionEngagement?.total ?? 0)}
                </span>
                <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  ER Sebaran: {formatPercentage(metrics.distributionEngagement?.rate)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatCompactNumber(metrics.distributionEngagement?.likes ?? 0)} Likes/Reaksi &bull; {formatCompactNumber(metrics.distributionEngagement?.shares ?? 0)} Shares penempatan sebaran
              </p>
            </div>
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
            Konten: <strong className="text-foreground">{metrics.totalContents}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
