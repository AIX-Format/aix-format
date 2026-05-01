/**
 * AIX v1.3.0 Revenue & Pricing Engine
 * Centralized logic for ABOM risk-adjusted costs and platform fees.
 */

export interface PricingConfig {
  base_price: number;
  platform_fee: number;
  quota: number;
  cutoff: "hard" | "grace" | "soft";
}

export const PI_SCALE = 1_000_000;

export const DEFAULT_PRICING: Record<string, PricingConfig> = {
  free:       { base_price: 0,     platform_fee: 0.20, quota: 100,   cutoff: "hard"  },
  builder:    { base_price: 0.005, platform_fee: 0.20, quota: 1000,  cutoff: "hard"  },
  pro:        { base_price: 0.01,  platform_fee: 0.10, quota: 10000, cutoff: "grace" },
  enterprise: { base_price: 0.05,  platform_fee: 0.05, quota: -1,    cutoff: "soft"  },
};

export const RISK_PREMIUMS = [
  { min: 90, multiplier: 0.0  },
  { min: 70, multiplier: 0.1  },
  { min: 40, multiplier: 0.25 },
  { min: 0,  multiplier: 0.5  },
];

export interface PriceBreakdown {
  totalCost: number;
  platformFee: number;
  developerShare: number;
  riskMultiplier: number;
}

/**
 * Calculates the total cost for an MCP tool call based on tier, risk, and complexity.
 */
export function calculatePrice(
  tier: string,
  riskScore: number,
  endpointType: string = 'stdio'
): PriceBreakdown {
  const config = DEFAULT_PRICING[tier] ?? DEFAULT_PRICING.free;
  
  // 1. Risk multiplier
  const riskMultiplier = RISK_PREMIUMS.find((p) => riskScore >= p.min)?.multiplier ?? 0;

  // 2. Complexity multiplier
  const complexityMap: Record<string, number> = {
    stdio: 1.0,
    http:  1.2,
    sse:   1.5,
  };
  const complexityMultiplier = complexityMap[endpointType] ?? 1.0;

  // 3. Calculation: Pt = (Bp × Mc) × (1 + Rp)
  const baseCost = config.base_price * complexityMultiplier;
  const totalCost = baseCost * (1 + riskMultiplier);
  const platformFee = totalCost * config.platform_fee;
  const developerShare = totalCost - platformFee;

  return {
    totalCost,
    platformFee,
    developerShare,
    riskMultiplier
  };
}

/**
 * Validates if a user has remaining quota.
 */
export function isQuotaExceeded(used: number, tier: string): boolean {
  const config = DEFAULT_PRICING[tier] ?? DEFAULT_PRICING.free;
  if (config.quota === -1) return false;
  return used >= config.quota;
}
