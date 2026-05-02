import { AIXParser } from '../core/parser.js';
import { AgentPaymentRouter } from '../core/agent_payment_router.js';

const manifestV14 = {
  meta: {
    name: "Axiom Sentinel",
    id: "did:axiom:axiomid.app:sentinel-001",
    version: "1.4.0"
  },
  security: {
    guardian_logic: {
      mempool_monitor: true,
      front_run_defense: true,
      emergency_circuit_breaker: true
    }
  },
  economics: {
    wallets: [
      { chain: "base", address: "0x123...abc", provider: "coinbase-agentkit", tee_secured: true },
      { chain: "solana", address: "sentinel.sol", provider: "generic" }
    ],
    payment_gateways: {
      stripe_acp: { enabled: true, merchant_id: "acct_123" },
      paypal_ap2: { enabled: true, mandate_id: "man_888" },
      x402: { enabled: true }
    },
    delegation: {
      allow_recursive: true,
      max_depth: 3,
      max_spend_per_delegate: { amount: 50, currency: "USD" }
    },
    treasury: {
      auto_yield_staking: true,
      preferred_yield_source: "AaveV4-Hub",
      flash_loan_arbitrage_enabled: true
    }
  }
};

async function runDemo() {
  console.log("--- AIX v1.4 Payment & Guardian System Demo ---");

  // 1. Validation
  const parser = new AIXParser();
  const agent = parser.parse(JSON.stringify(manifestV14));
  
  if (parser.errors.length > 0) {
    console.error("Validation Errors:", parser.errors);
    return;
  }
  console.log("✅ Manifest Validated Successfully (AIX v1.4)");
  console.log("Warnings:", parser.warnings);

  // 2. Payment Routing
  const router = new AgentPaymentRouter(agent.data);
  
  console.log("\nScenario A: Micropayment for AI Inference (x402)");
  const res1 = await router.routePayment(0.01, 'USDC', 'api.provider.ai');
  console.log("Result:", res1);

  console.log("\nScenario B: Institutional SaaS Subscription (Stripe ACP)");
  const res2 = await router.routePayment(99, 'USD', 'saas_corp_99');
  console.log("Result:", res2);

  // 3. Treasury Optimization
  console.log("\nScenario C: Autonomous Treasury Management");
  const treasuryResult = await router.optimizeTreasury();
  console.log("Treasury Action:", treasuryResult);

  // 4. Guardian Protection
  console.log("\nScenario D: Guardian Logic Active");
  console.log("Guardian Config:", agent.guardian_logic);
}

runDemo().catch(console.error);
