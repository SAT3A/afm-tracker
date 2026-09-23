/**
 * AFM Tracker — Diagnostic Engine
 *
 * Implements rule-based, sample-protected performance diagnostics.
 * Uses hypothesis-driven language ("Kemungkinan bottleneck", "Saran uji coba")
 * to support iterative experimentation rather than claiming causal certainty.
 */

import { ANALYTICS_CONFIG, type MetricBasis } from "./config.ts";
import {
  calculateEngagementRate,
  calculateCTR,
  calculateConversionRate,
  resolveReach,
} from "./metrics.ts";

export type DiagnosisStatus =
  | "INSUFFICIENT_DATA"
  | "WINNER"
  | "HIGH_ATTENTION_WEAK_CTA"
  | "HIGH_COMMERCIAL_INTENT"
  | "LOW_TRACTION";

export interface DiagnosticResult {
  status: DiagnosisStatus;
  badgeLabel: string;
  badgeVariant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
  er: number | null;
  ctr: number | null;
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
 * Evaluates reach according to selected metricBasis (views or impressions).
 */
export function diagnoseContentPerformance(params: {
  metricBasis?: MetricBasis;
  reach?: number | null;
  views?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  orders?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
}): DiagnosticResult {
  const basis: MetricBasis =
    params.metricBasis ||
    (params.impressions && !params.views ? "impressions" : "views");

  const reach =
    params.reach != null
      ? Math.max(0, Number(params.reach) || 0)
      : resolveReach({
          metricBasis: basis,
          views: params.views,
          impressions: params.impressions,
        });

  const clicks = Math.max(0, Number(params.clicks) || 0);
  const orders = Math.max(0, Number(params.orders) || 0);

  const { rate: er } = calculateEngagementRate(
    {
      likes: params.likes,
      comments: params.comments,
      shares: params.shares,
      saves: params.saves,
    },
    reach,
    basis
  );

  const { ctr } = calculateCTR(clicks, reach, basis);
  const cvr = calculateConversionRate(orders, clicks);

  const reachSufficient = reach >= ANALYTICS_CONFIG.MIN_REACH_FOR_DIAGNOSIS;
  const clicksSufficientForCVR =
    clicks >= ANALYTICS_CONFIG.MIN_CLICKS_FOR_CVR_ANALYSIS;

  // 1. Guard against small sample sizes (based on reach, not video views only)
  if (!reachSufficient) {
    const reachUnit = basis === "impressions" ? "impresi" : "views";
    return {
      status: "INSUFFICIENT_DATA",
      badgeLabel: "Sample Terbatas",
      badgeVariant: "outline",
      er,
      ctr,
      cvr,
      sampleSufficiency: {
        viewsSufficient: reachSufficient,
        clicksSufficientForCVR,
        currentViews: reach,
        currentClicks: clicks,
      },
      possibleBottleneck: null,
      suggestedTest: `Butuh minimal ${ANALYTICS_CONFIG.MIN_REACH_FOR_DIAGNOSIS} ${reachUnit} untuk diagnosis terpercaya (saat ini: ${reach} ${reachUnit}).`,
    };
  }

  const isHighER = (er ?? 0) >= ANALYTICS_CONFIG.HIGH_ER_THRESHOLD;
  const isHighCTR = (ctr ?? 0) >= ANALYTICS_CONFIG.HIGH_CTR_THRESHOLD;

  // 2. Classify into diagnostic quadrants
  if (isHighER && isHighCTR) {
    return {
      status: "WINNER",
      badgeLabel: "Potential Winner",
      badgeVariant: "success",
      er,
      ctr,
      cvr,
      sampleSufficiency: {
        viewsSufficient: reachSufficient,
        clicksSufficientForCVR,
        currentViews: reach,
        currentClicks: clicks,
      },
      possibleBottleneck:
        clicksSufficientForCVR && cvr < ANALYTICS_CONFIG.HIGH_CVR_THRESHOLD
          ? "Kemungkinan bottleneck: Penawaran di halaman Shopee (harga, rating toko, atau stok) menghambat konversi checkout."
          : null,
      suggestedTest:
        "Konten dan klik sangat kuat. Pertimbangkan menambah frekuensi distribusi atau mengulang creative angle ini.",
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
      sampleSufficiency: {
        viewsSufficient: reachSufficient,
        clicksSufficientForCVR,
        currentViews: reach,
        currentClicks: clicks,
      },
      possibleBottleneck:
        "Kemungkinan bottleneck: Relevansi produk atau kejelasan ajakan bertindak (CTA) kurang kuat dibandingkan daya tarik konten hiburan.",
      suggestedTest:
        "Pertimbangkan mengganti kalimat CTA atau memperjelas manfaat produk sebelum audiens selesai menonton/membaca.",
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
      sampleSufficiency: {
        viewsSufficient: reachSufficient,
        clicksSufficientForCVR,
        currentViews: reach,
        currentClicks: clicks,
      },
      possibleBottleneck:
        "Kemungkinan bottleneck: Jangkauan / reach konten masih terbatas meskipun audiens yang melihat memiliki niat beli tinggi.",
      suggestedTest:
        "Audiens sangat tertarik membeli. Uji coba perbanyak sebaran link ke grup/channel lain dengan hook serupa.",
    };
  }

  return {
    status: "LOW_TRACTION",
    badgeLabel: "Low Traction",
    badgeVariant: "secondary",
    er,
    ctr,
    cvr,
    sampleSufficiency: {
      viewsSufficient: reachSufficient,
      clicksSufficientForCVR,
      currentViews: reach,
      currentClicks: clicks,
    },
    possibleBottleneck:
      "Kemungkinan bottleneck: Hook pembuka atau pemilihan angle produk belum memikat perhatian audiens sasaran.",
    suggestedTest:
      "Coba ganti 3 detik pertama video (hook) atau uji coba kategori produk berbeda pada slot jadwal berikutnya.",
  };
}

export const evaluateContentDiagnostics = diagnoseContentPerformance;
