/**
 * AFM Tracker — Centralized Analytics Configuration
 *
 * Defines threshold values for sample size protection, benchmark conversion rates,
 * and canonical attribution guidelines.
 */

export const ANALYTICS_CONFIG = {
  // Sample size protection thresholds (Guard against aggressive diagnosis on tiny samples)
  MIN_VIEWS_FOR_DIAGNOSIS: 500,
  MIN_CLICKS_FOR_CVR_ANALYSIS: 20,
  MIN_DISTRIBUTIONS_FOR_CHANNEL_RANK: 2,

  // Benchmark comparison thresholds (Observable percentiles)
  HIGH_ER_THRESHOLD: 4.0,   // >= 4.0% Engagement Rate is considered High
  HIGH_CTR_THRESHOLD: 2.5,  // >= 2.5% Affiliate CTR is considered High
  HIGH_CVR_THRESHOLD: 5.0,  // >= 5.0% Click-to-Order Conversion is considered High

  // Default date filter
  DEFAULT_DATE_RANGE: "14d" as const, // "7d" | "14d" | "30d" | "all"
} as const;

export type DateRangeOption = "7d" | "14d" | "30d" | "all";
export type MetricBasis = "views" | "impressions" | "mixed";
