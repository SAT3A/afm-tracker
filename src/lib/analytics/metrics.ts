/**
 * AFM Tracker — Centralized Metric Engine
 *
 * Provides standardized, zero-division safe formulas and formatters
 * across the entire AFM Tracker analytics pipeline.
 */

import type { MetricBasis } from "./config.ts";

/**
 * Explicitly resolves reach from observable views/impressions based on metricBasis.
 * Guard: Never uses truthiness fallback when both values exist.
 */
export function resolveReach(params: {
  metricBasis: MetricBasis;
  views?: number | null;
  impressions?: number | null;
}): number {
  if (params.metricBasis === "views") {
    return Math.max(0, Number(params.views) || 0);
  }
  if (params.metricBasis === "impressions") {
    return Math.max(0, Number(params.impressions) || 0);
  }
  // Mixed basis reach is an informational observation aggregate
  return (
    Math.max(0, Number(params.views) || 0) +
    Math.max(0, Number(params.impressions) || 0)
  );
}

/**
 * Calculates Engagement Rate (%)
 * Formula: (likes + comments + shares + saves) / denominator * 100
 * Guard: Returns null for Mixed Basis to prevent invalid universal ratios.
 */
export function calculateEngagementRate(
  interactions:
    | {
        likes?: number | null;
        comments?: number | null;
        shares?: number | null;
        saves?: number | null;
      }
    | number,
  denominator: number | null | undefined,
  basis: MetricBasis = "views"
): { rate: number | null; basis: MetricBasis; isMixed: boolean } {
  if (basis === "mixed") {
    return { rate: null, basis: "mixed", isMixed: true };
  }

  const safeDenom = Number(denominator) || 0;
  if (safeDenom <= 0) {
    return { rate: 0, basis, isMixed: false };
  }

  let totalInteractions = 0;
  if (typeof interactions === "number") {
    totalInteractions = Math.max(0, interactions || 0);
  } else if (interactions) {
    totalInteractions =
      Math.max(0, interactions.likes || 0) +
      Math.max(0, interactions.comments || 0) +
      Math.max(0, interactions.shares || 0) +
      Math.max(0, interactions.saves || 0);
  }

  const rate = (totalInteractions / safeDenom) * 100;
  return {
    rate: Number.isFinite(rate) ? Number(rate.toFixed(2)) : 0,
    basis,
    isMixed: false,
  };
}

/**
 * Calculates Affiliate CTR (%)
 * Formula: affiliateClicks / denominator * 100
 * Guard: Returns null for Mixed Basis to prevent invalid universal ratios.
 */
export function calculateCTR(
  affiliateClicks: number | null | undefined,
  denominator: number | null | undefined,
  basis: MetricBasis = "views"
): { ctr: number | null; basis: MetricBasis; isMixed: boolean } {
  if (basis === "mixed") {
    return { ctr: null, basis: "mixed", isMixed: true };
  }

  const safeClicks = Math.max(0, Number(affiliateClicks) || 0);
  const safeDenom = Number(denominator) || 0;

  if (safeDenom <= 0) {
    return { ctr: 0, basis, isMixed: false };
  }

  const ctr = (safeClicks / safeDenom) * 100;
  return {
    ctr: Number.isFinite(ctr) ? Number(ctr.toFixed(2)) : 0,
    basis,
    isMixed: false,
  };
}

/**
 * Calculates Click-to-Order Conversion Rate (CVR %)
 * Formula: orders / affiliateClicks * 100
 */
export function calculateConversionRate(
  orders: number | null | undefined,
  affiliateClicks: number | null | undefined
): number {
  const safeOrders = Math.max(0, Number(orders) || 0);
  const safeClicks = Number(affiliateClicks) || 0;

  if (safeClicks <= 0) {
    return 0;
  }

  const cvr = (safeOrders / safeClicks) * 100;
  return Number.isFinite(cvr) ? Number(cvr.toFixed(2)) : 0;
}

/**
 * Calculates Earnings Per Click (EPC)
 * Formula: commission (in IDR) / affiliateClicks
 */
export function calculateEPC(
  commission: number | null | undefined,
  affiliateClicks: number | null | undefined
): number {
  const safeComm = Math.max(0, Number(commission) || 0);
  const safeClicks = Number(affiliateClicks) || 0;

  if (safeClicks <= 0) {
    return 0;
  }

  const epc = safeComm / safeClicks;
  return Number.isFinite(epc) ? Math.round(epc) : 0;
}

/**
 * Calculates Commission per 1,000 Impressions/Views (RPM)
 * Formula: commission / denominator * 1000
 */
export function calculateCommissionPer1000(
  commission: number | null | undefined,
  denominator: number | null | undefined
): number {
  const safeComm = Math.max(0, Number(commission) || 0);
  const safeDenom = Number(denominator) || 0;

  if (safeDenom <= 0) {
    return 0;
  }

  const rpm = (safeComm / safeDenom) * 1000;
  return Number.isFinite(rpm) ? Math.round(rpm) : 0;
}

/**
 * Calculates Efficiency per Distribution (e.g. Clicks per Dist, Commission per Dist)
 * Formula: metricTotal / distributionCount
 */
export function calculateEfficiency(
  metricTotal: number | null | undefined,
  distributionCount: number | null | undefined
): number {
  const safeTotal = Math.max(0, Number(metricTotal) || 0);
  const safeCount = Number(distributionCount) || 0;

  if (safeCount <= 0) {
    return 0;
  }

  const eff = safeTotal / safeCount;
  return Number.isFinite(eff) ? Number(eff.toFixed(1)) : 0;
}

/**
 * Format IDR Currency with readable abbreviation if desired
 */
export function formatCurrencyIDR(
  amount: number | null | undefined,
  compact = false
): string {
  if (amount == null) return "N/A";
  const safeAmount = Math.max(0, Number(amount) || 0);

  if (compact && safeAmount >= 1_000_000) {
    return `Rp ${(safeAmount / 1_000_000).toFixed(1)}Jt`;
  }
  if (compact && safeAmount >= 1_000) {
    return `Rp ${(safeAmount / 1_000).toFixed(0)}K`;
  }

  return `Rp ${Math.round(safeAmount).toLocaleString("id-ID")}`;
}

/**
 * Format Percentage (e.g. 3.4%, or N/A when null)
 */
export function formatPercentage(
  val: number | null | undefined,
  fallback = "N/A"
): string {
  if (val == null) return fallback;
  return `${val.toFixed(1)}%`;
}

/**
 * Format Compact Number (e.g. 523K, 1.2M)
 */
export function formatCompactNumber(val: number | null | undefined): string {
  const safeVal = Math.max(0, Number(val) || 0);
  if (safeVal >= 1_000_000) {
    return `${(safeVal / 1_000_000).toFixed(1)}M`;
  }
  if (safeVal >= 1_000) {
    return `${(safeVal / 1_000).toFixed(1)}K`;
  }
  return safeVal.toLocaleString("id-ID");
}

/**
 * Formats relative content age from publishedAt date
 * e.g. "2 jam lalu", "3 hari lalu", "2 minggu lalu"
 */
export function formatContentAge(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "Baru saja";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMins} menit lalu`;
  }
  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }
  if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  }
  if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} minggu lalu`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} bulan lalu`;
}
