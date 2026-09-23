import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEngagementRate,
  calculateCTR,
  calculateConversionRate,
  calculateEPC,
  calculateCommissionPer1000,
  calculateEfficiency,
  formatCurrencyIDR,
  formatPercentage,
  formatCompactNumber,
  formatContentAge,
} from "./metrics.ts";

test("calculateEngagementRate - normal values", () => {
  const result = calculateEngagementRate(
    { likes: 200, comments: 50, shares: 30, saves: 20 },
    10000,
    "views"
  );
  assert.equal(result.rate, 3.0);
  assert.equal(result.basis, "views");
});

test("calculateEngagementRate - zero denominator safety", () => {
  const result = calculateEngagementRate({ likes: 50 }, 0);
  assert.equal(result.rate, 0);
  assert.equal(Number.isFinite(result.rate), true);
});

test("calculateEngagementRate - null or negative inputs", () => {
  const result = calculateEngagementRate(null, -100);
  assert.equal(result.rate, 0);
});

test("calculateCTR - normal calculation", () => {
  const result = calculateCTR(350, 10000, "impressions");
  assert.equal(result.ctr, 3.5);
  assert.equal(result.basis, "impressions");
});

test("calculateCTR - zero denominator safety", () => {
  const result = calculateCTR(100, 0);
  assert.equal(result.ctr, 0);
});

test("calculateConversionRate - normal calculation", () => {
  const cvr = calculateConversionRate(15, 300);
  assert.equal(cvr, 5.0);
});

test("calculateConversionRate - zero clicks safety", () => {
  const cvr = calculateConversionRate(10, 0);
  assert.equal(cvr, 0);
  assert.equal(Number.isFinite(cvr), true);
});

test("calculateEPC - normal calculation", () => {
  const epc = calculateEPC(750000, 250);
  assert.equal(epc, 3000);
});

test("calculateEPC - zero clicks safety", () => {
  const epc = calculateEPC(500000, 0);
  assert.equal(epc, 0);
});

test("calculateCommissionPer1000 - RPM calculation", () => {
  const rpm = calculateCommissionPer1000(150000, 10000);
  assert.equal(rpm, 15000);
});

test("calculateEfficiency - Clicks per Distribution", () => {
  const eff = calculateEfficiency(450, 3);
  assert.equal(eff, 150.0);
});

test("calculateEfficiency - zero distribution count safety", () => {
  const eff = calculateEfficiency(100, 0);
  assert.equal(eff, 0);
});

test("formatters - Currency IDR and Percent", () => {
  assert.equal(formatCurrencyIDR(1500000, true), "Rp 1.5Jt");
  assert.equal(formatCurrencyIDR(25000, false), "Rp 25.000");
  assert.equal(formatPercentage(3.456), "3.5%");
  assert.equal(formatCompactNumber(1200000), "1.2M");
  assert.equal(formatCompactNumber(4500), "4.5K");
});

test("formatContentAge - relative age formatting", () => {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  assert.match(formatContentAge(twoHoursAgo), /jam lalu/);
  assert.match(formatContentAge(threeDaysAgo), /hari lalu/);
  assert.equal(formatContentAge("invalid-date"), "-");
});
