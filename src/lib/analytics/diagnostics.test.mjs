import test from "node:test";
import assert from "node:assert/strict";
import { diagnoseContentPerformance } from "./diagnostics.ts";

test("diagnostics - returns INSUFFICIENT_DATA when views < 500", () => {
  const result = diagnoseContentPerformance({
    views: 120, // below 500 threshold
    clicks: 15,
    likes: 20,
  });

  assert.equal(result.status, "INSUFFICIENT_DATA");
  assert.equal(result.badgeLabel, "Sample Terbatas");
  assert.equal(result.sampleSufficiency.viewsSufficient, false);
  assert.match(result.suggestedTest, /Butuh minimal 500 views/);
  assert.equal(result.possibleBottleneck, null);
});

test("diagnostics - classifies WINNER when ER >= 4% and CTR >= 2.5%", () => {
  const result = diagnoseContentPerformance({
    views: 1000,
    clicks: 40,   // CTR = 4% (High)
    likes: 50,
    comments: 10, // ER = 6% (High)
    orders: 4,    // CVR = 10%
  });

  assert.equal(result.status, "WINNER");
  assert.equal(result.badgeLabel, "Potential Winner");
  assert.equal(result.sampleSufficiency.viewsSufficient, true);
  assert.match(result.suggestedTest, /Konten dan klik sangat kuat/);
});

test("diagnostics - classifies HIGH_ATTENTION_WEAK_CTA when ER is high but CTR is low", () => {
  const result = diagnoseContentPerformance({
    views: 2000,
    clicks: 10,   // CTR = 0.5% (Low)
    likes: 120,
    comments: 20, // ER = 7% (High)
  });

  assert.equal(result.status, "HIGH_ATTENTION_WEAK_CTA");
  assert.equal(result.badgeLabel, "High Attention");
  assert.match(result.possibleBottleneck, /Relevansi produk atau kejelasan ajakan bertindak/);
  assert.match(result.suggestedTest, /mengganti kalimat CTA/);
});

test("diagnostics - classifies HIGH_COMMERCIAL_INTENT when ER is low but CTR is high", () => {
  const result = diagnoseContentPerformance({
    views: 1500,
    clicks: 60,  // CTR = 4% (High)
    likes: 15,   // ER = 1% (Low)
  });

  assert.equal(result.status, "HIGH_COMMERCIAL_INTENT");
  assert.equal(result.badgeLabel, "High Intent");
  assert.match(result.possibleBottleneck, /Jangkauan \/ reach konten masih terbatas/);
  assert.match(result.suggestedTest, /perbanyak sebaran link/);
});

test("diagnostics - classifies LOW_TRACTION when both ER and CTR are low", () => {
  const result = diagnoseContentPerformance({
    views: 800,
    clicks: 5,   // CTR = 0.625% (Low)
    likes: 8,    // ER = 1% (Low)
  });

  assert.equal(result.status, "LOW_TRACTION");
  assert.equal(result.badgeLabel, "Low Traction");
  assert.match(result.possibleBottleneck, /Hook pembuka atau pemilihan angle produk/);
});
