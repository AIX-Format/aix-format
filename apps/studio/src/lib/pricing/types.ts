export interface PricingConfig {
  base_price: number;
  platform_fee: number;
  quota: number;
  cutoff: "hard" | "grace" | "soft";
}

export interface PriceBreakdown {
  totalCost: number;
  platformFee: number;
  developerShare: number;
  riskMultiplier: number;
}
