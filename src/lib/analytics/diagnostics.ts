/**
 * AFM Tracker — Diagnostic Engine
 *
 * Implements rule-based, sample-protected performance diagnostics.
 * Uses hypothesis-driven language ("Kemungkinan bottleneck", "Saran uji coba")
 * to support iterative experimentation rather than claiming causal certainty.
 */

import { ANALYTICS_CONFIG } from "./config.ts";
import { calculateEngagementRate, calculateCTR, calculateConversionRate } from "./metrics.ts";

export type DiagnosisStatus =
  | "INSUFFICIENT_DATA"
  | "WINNER"
  | "HIGH_ATTENTION_WEAK_CTA"
  | "HIGH_COMMERCIAL_INTENT"
  | "LOW_TRACTION";

export interface DiagnosticResult {
  status: DiagnosisStatus;
  badgeLabel: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  er: number;
  ctr: number;
  cvr: number;
  sampleSufficiency: {
    viewsSufficient: boolean;
    clicksSufficientForCVR: boolean;
    currentViews: number;
    currentClicks: number;
  };
  possibleBottleneck: string | null;
  suggestedTest: string | null;
}

/**
 * Diagnoses content performance against observable threshold benchmarks.
 */
export function diagnoseContentPerformance(params: {
  views?: number | null;
  clicks?: number | null;
  orders?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
}): DiagnosticResult {
  const views = Math.max(0, Number(params.views) || 0);
  const clicks = Math.max(0, Number(params.clicks) || 0);
  const orders = Math.max(0, Number(params.orders) || 0);

  const { rate: er } = calculateEngagementRate(
    {
      likes: params.likes,
      comments: params.comments,
      shares: params.shares,
      saves: params.saves,
    },
    views
  );

  const { ctr } = calculateCTR(clicks, views);
  const cvr = calculateConversionRate(orders, clicks);

  const viewsSufficient = views >= ANALYTICS_CONFIG.MIN_VIEWS_FOR_DIAGNOSIS;
  const clicksSufficientForCVR = clicks >= ANALYTICS_CONFIG.MIN_CLICKS_FOR_CVR_ANALYSIS;

  // 1. Guard against small sample sizes
  if (!viewsSufficient) {
    return {
      status: "INSUFFICIENT_DATA",
      badgeLabel: "Sample Terbatas",
      badgeVariant: "outline",
      er,
      ctr,
      cvr,
      sampleSufficiency: {
        viewsSufficient,
        clicksSufficientForCVR,
        currentViews: views,
        currentClicks: clicks,
      },
      possibleBottleneck: null,
      suggestedTest: `Butuh minimal ${ANALYTICS_CONFIG.MIN_VIEWS_FOR_DIAGNOSIS} views untuk diagnosis terpercaya (saat ini: ${views} views).`,
    };
  }

  const isHighER = er >= ANALYTICS_CONFIG.HIGH_ER_THRESHOLD;
  const isHighCTR = ctr >= ANALYTICS_CONFIG.HIGH_CTR_THRESHOLD;

  // 2. Classify into diagnostic quadrants
  if (isHighER && isHighCTR) {
    return {
      status: "WINNER",
      badgeLabel: "Potential Winner",
      badgeVariant: "success",
      er,
      ctr,
      cvr,
      sampleSufficiency: { viewsSufficient, clicksSufficientForCVR, currentViews: views, currentClicks: clicks },
      possibleBottleneck: clicksSufficientForCVR && cvr < ANALYTICS_CONFIG.HIGH_CVR_THRESHOLD
        ? "Kemungkinan bottleneck: Penawaran di halaman Shopee (harga, rating toko, atau stok) menghambat konversi checkout."
        : null,
      suggestedTest: "Konten dan klik sangat kuat. Pertimbangkan menambah frekuensi distribusi atau mengulang creative angle ini.",
    };
  }

  if (isHighER && !isHighCTR) {
    return {
      status: "HIGH_ATTENTION_WEAK_CTA",
      badgeLabel: "High Attention",
      badgeVariant: "warning",
      er,
      ctr,
      cvr,
      sampleSufficiency: { viewsSufficient, clicksSufficientForCVR, currentViews: views, currentClicks: clicks },
      possibleBottleneck: "Kemungkinan bottleneck: Relevansi produk atau kejelasan ajakan bertindak (CTA) kurang kuat dibandingkan daya tarik konten hiburan.",
      suggestedTest: "Pertimbangkan mengganti kalimat CTA atau memperjelas manfaat produk sebelum audiens selesai menonton.",
    };
  }

  if (!isHighER && isHighCTR) {
    return {
      status: "HIGH_COMMERCIAL_INTENT",
      badgeLabel: "High Intent",
      badgeVariant: "default",
      er,
      ctr,
      cvr,
      sampleSufficiency: { viewsSufficient, clicksSufficientForCVR, currentViews: views, currentClicks: clicks },
      possibleBottleneck: "Kemungkinan bottleneck: Jangkauan / reach konten masih terbatas meskipun audiens yang melihat memiliki niat beli tinggi.",
      suggestedTest: "Audiens sangat tertarik membeli. Uji coba perbanyak sebaran link ke grup/channel lain dengan hook serupa.",
    };
  }

  return {
    status: "LOW_TRACTION",
    badgeLabel: "Low Traction",
    badgeVariant: "secondary",
    er,
    ctr,
    cvr,
    sampleSufficiency: { viewsSufficient, clicksSufficientForCVR, currentViews: views, currentClicks: clicks },
    possibleBottleneck: "Kemungkinan bottleneck: Hook pembuka atau pemilihan angle produk belum memikat perhatian audiens sasaran.",
    suggestedTest: "Coba ganti 3 detik pertama video (hook) atau uji coba kategori produk berbeda pada slot jadwal berikutnya.",
  };
}

export const evaluateContentDiagnostics = diagnoseContentPerformance;
