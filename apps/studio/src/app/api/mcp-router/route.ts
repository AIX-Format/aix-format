import { NextRequest, NextResponse } from "next/server";
import { kv, NS } from "@/lib/storage/redis";
import { scanAgent } from "@/lib/abom-scanner";
import { getRegistry } from "@/lib/registry";

// Internal scaling for currency to avoid floating point issues (1 unit = 0.000001 Pi)
const PI_SCALE = 1_000_000;

interface PricingConfig {
  base_price: number;
  platform_fee: number;
  quota: number;
  cutoff: "hard" | "grace" | "soft";
}

const DEFAULT_PRICING: Record<string, PricingConfig> = {
  free:       { base_price: 0,     platform_fee: 0.20, quota: 100,   cutoff: "hard"  },
  builder:    { base_price: 0.005, platform_fee: 0.20, quota: 1000,  cutoff: "hard"  },
  pro:        { base_price: 0.01,  platform_fee: 0.10, quota: 10000, cutoff: "grace" },
  enterprise: { base_price: 0.05,  platform_fee: 0.05, quota: -1,    cutoff: "soft"  },
};

const RISK_PREMIUMS = [
  { min: 90, multiplier: 0.0  },
  { min: 70, multiplier: 0.1  },
  { min: 40, multiplier: 0.25 },
  { min: 0,  multiplier: 0.5  },
];

/**
 * MCP Revenue Router — POST /api/mcp-router
 *
 * Flow:
 *  1. Identify user tier & quota
 *  2. Scan target agent ABOM for risk
 *  3. Calculate price & platform fee
 *  4. Update quota & track spend metrics
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, agentDid, endpointType, tier = "free" } = await req.json();

    if (!userId || !agentDid) {
      return NextResponse.json(
        { error: "Missing required fields: userId, agentDid" },
        { status: 400 }
      );
    }

    // 1. Pricing config
    const config = DEFAULT_PRICING[tier] ?? DEFAULT_PRICING.free;
    const quotaKey = `${NS.REVENUE}:quota:${userId}`;

    // 2. Quota check (Redis-backed)
    const usedQuota = (await kv.get<number>(quotaKey)) ?? 0;
    if (config.quota !== -1 && usedQuota >= config.quota) {
      if (config.cutoff === "hard") {
        return NextResponse.json({ error: "Quota exceeded" }, { status: 429 });
      }
    }

    // 3. Agent risk scoring
    const registry = await getRegistry();
    const agent = registry.find((a: { did: string }) => a.did === agentDid);
    const abomReport = agent
      ? scanAgent(JSON.parse((agent as { yaml: string }).yaml))
      : { score: 50 };

    const riskMultiplier =
      RISK_PREMIUMS.find((p) => abomReport.score >= p.min)?.multiplier ?? 0;

    // 4. Price calculation: Pt = (Bp × Mc) × (1 + Rp)
    const complexityMap: Record<string, number> = {
      stdio: 1.0,
      http:  1.2,
      sse:   1.5,
    };
    const complexityMultiplier = complexityMap[endpointType] ?? 1.0;
    const baseCost   = config.base_price * complexityMultiplier;
    const totalCost  = baseCost * (1 + riskMultiplier);
    const platformFee    = totalCost * config.platform_fee;
    const developerShare = totalCost - platformFee;

    // 5. Atomic quota increment
    const newUsed = await kv.incr(quotaKey);

    // 6. Metric tracking (fire-and-forget, failures don't abort the response)
    const spendKey     = `${NS.REVENUE}:spend:${userId}`;
    const earningKey   = `${NS.REVENUE}:earnings:${agentDid}`;

    void Promise.all([
      kv.incr(`${NS.REVENUE}:total_calls`),
      kv.get<number>(spendKey).then((cur) =>
        kv.set(spendKey, ((cur ?? 0) + totalCost * PI_SCALE))
      ),
      kv.get<number>(earningKey).then((cur) =>
        kv.set(earningKey, ((cur ?? 0) + developerShare * PI_SCALE))
      ),
    ]).catch((err) => console.error("[MCP Router] Metrics write error:", err));

    return NextResponse.json({
      success: true,
      price:    totalCost,
      currency: "Pi",
      quota: {
        used:      newUsed,
        total:     config.quota,
        remaining: config.quota === -1 ? -1 : config.quota - newUsed,
      },
      routing: {
        target:    agentDid,
        riskScore: abomReport.score,
        premium:   riskMultiplier,
      },
    });
  } catch (error) {
    console.error("[MCP Router] Execution Error:", error);
    return NextResponse.json(
      { error: "Internal Router Error" },
      { status: 500 }
    );
  }
}
