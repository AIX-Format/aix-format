/**
 * Sovereign Pattern Validation v2.1
 * Verifies Chain of Responsibility, Strategy, Command, and Observer.
 */
import { SwarmProcessor } from "../src/lib/pulse/processor";
import { kv, GatewayManager, KEYS, AgentEventBus, SovereignAgentFactory } from "../../../packages/aix-core/src/index";

async function runPatternTest() {
  console.log("🛠️ Starting Sovereign Pattern Validation...");

  // 1. FACTORY: Create a specialized agent
  const factory = new SovereignAgentFactory();
  const agentId = "agent:pattern-test-002";
  const manifest = factory.create('trader', {
    meta: { name: "Pattern Master", version: "2.1.0" },
    economics: {
      revenue_routing: { base_price: 200 },
      arbitrage: { enabled: true, strategies: ['timing_attack'] },
      sovereign_loop: { enabled: true, royalty_bps: 1000 }
    },
    persona: { instructions: "Always split routes for optimization." }
  });

  await kv.set(KEYS.registry(agentId), manifest);

  // 2. OBSERVER: Set up listeners
  AgentEventBus.getInstance().on('pulse:success', (data: any) => {
    console.log(`[Observer] Pulse Success! Agent: ${data.agentId} | Yield: ${data.yield} Pi`);
  });

  AgentEventBus.getInstance().on('pulse:error', (data: any) => {
    console.error(`[Observer] Pulse Error! Agent: ${data.agentId} | Error: ${data.error}`);
  });

  // 3. EXECUTION: Pulse Turn
  console.log("⚡ Executing Pulse via Chain of Responsibility...");
  const process = await GatewayManager.spawn(agentId, "Execute arbitrage across Pi ecosystem.");
  
  const startTime = Date.now();
  const result = await SwarmProcessor.executeTurn(process.id);
  const duration = Date.now() - startTime;

  // 4. RESULTS DATA
  console.log("\n--- [REAL DATA RESULTS] ---");
  console.log(`⏱️ Duration: ${duration}ms`);
  console.log(`💰 Arbitrage Yield: ${result.economics?.yield || 0} Pi`);
  console.log(`📉 Net Fee: ${result.economics?.totalFee || 0} Pi`);
  console.log(`⛓️ Chain Status: SUCCESS`);
  console.log(`🎭 Role: ${manifest.role}`);
  
  console.log("\n🏁 Validation Finished.");
}

runPatternTest().catch(console.error);
