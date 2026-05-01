import test from 'node:test';
import assert from 'node:assert';
import { calculatePrice, isQuotaExceeded, DEFAULT_PRICING } from '../apps/studio/src/lib/pricing.ts';

/**
 * AIX v1.3.0 Pricing & Revenue Unit Tests
 */

test('Pricing Engine: Low-Risk Free Tier', () => {
  // Scenario: Free tier, high trust score (95), stdio
  const breakdown = calculatePrice('free', 95, 'stdio');
  
  assert.strictEqual(breakdown.totalCost, 0, 'Free tier must always result in 0 total cost');
  assert.strictEqual(breakdown.riskMultiplier, 0, 'Trust score > 90 should have 0% risk premium');
  assert.strictEqual(breakdown.platformFee, 0, 'Platform fee on 0 cost must be 0');
});

test('Pricing Engine: High-Risk Enterprise Tier', () => {
  // Scenario: Enterprise tier, low trust score (10), sse endpoint
  // Base: 0.05, Complexity(SSE): 1.5, Risk(Score 10): 0.5 premium
  const breakdown = calculatePrice('enterprise', 10, 'sse');
  
  const expectedBase = 0.05 * 1.5;
  const expectedTotal = expectedBase * (1 + 0.5);
  const expectedFee = expectedTotal * 0.05; // Enterprise platform fee is 5%
  
  assert.strictEqual(breakdown.totalCost, expectedTotal, 'Total cost should reflect base * complexity * risk');
  assert.strictEqual(breakdown.platformFee, expectedFee, 'Platform fee should be 5% for enterprise');
  assert.strictEqual(breakdown.developerShare, expectedTotal - expectedFee, 'Developer share must be total - fee');
});

test('Quota Guard: Exhaustion Scenarios', () => {
  // Scenario 1: Free tier at limit
  const freeLimit = DEFAULT_PRICING.free.quota;
  assert.strictEqual(isQuotaExceeded(freeLimit, 'free'), true, 'Should be exceeded at exact quota limit');
  assert.strictEqual(isQuotaExceeded(freeLimit - 1, 'free'), false, 'Should NOT be exceeded below quota limit');
  
  // Scenario 2: Enterprise tier (unlimited)
  assert.strictEqual(isQuotaExceeded(999999, 'enterprise'), false, 'Enterprise tier should never be exceeded (-1 quota)');
  
  // Scenario 3: Builder tier over limit
  const builderLimit = DEFAULT_PRICING.builder.quota;
  assert.strictEqual(isQuotaExceeded(builderLimit + 50, 'builder'), true, 'Should be exceeded significantly over limit');
});
