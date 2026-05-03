import { PricingConfig } from './types';

export const PI_SCALE = 1_000_000;

export const KYC_CONFIG: Record<string, { fee: number; limit: number }> = {
  anonymous:     { fee: 0.05, limit: 0 },         // View Only, high security fee
  basic:         { fee: 0.02, limit: 1000 },      // 2% Fee, <$1K
  verified:      { fee: 0.01, limit: 10000 },     // 1% Fee, $1K-$10K
  sovereign:     { fee: 0.005, limit: 100000 },   // 0.5% Fee, >$10K
  institutional: { fee: 0.002, limit: -1 },       // Custom/Minimal Fee, Unlimited
};

export const DEFAULT_PRICING: Record<string, PricingConfig> = {
  free:       { base_price: 0,     platform_fee: 0.02, quota: 100,   cutoff: "hard"  },
  builder:    { base_price: 0.005, platform_fee: 0.01, quota: 1000,  cutoff: "hard"  },
  pro:        { base_price: 0.01,  platform_fee: 0.005, quota: 10000, cutoff: "grace" },
  enterprise: { base_price: 0.05,  platform_fee: 0.002, quota: -1,    cutoff: "soft"  },
};

export const RISK_PREMIUMS = [
  { min: 90, multiplier: 0.5   }, // 90-100 = Critical Risk
  { min: 70, multiplier: 0.25  }, // 70-89  = High Risk
  { min: 40, multiplier: 0.1   }, // 40-69  = Moderate Risk
  { min: 0,  multiplier: 0.0   }, // 0-39   = Safe
];
