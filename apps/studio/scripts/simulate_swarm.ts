import { SwarmProcessor } from "../src/lib/pulse/processor";
import { kv, KEYS } from "@aix-core/storage";

async function simulate() {
  console.log("🚀 Starting AIX Swarm Simulation...");
  
  const testAgentId = "test-swarm-agent";
  
  // 1. Setup Mock Manifest with Economic Hacks and Ghost Config
  await kv.set(KEYS.registry(testAgentId), {
    meta: { name: "SwarmMaster v1" },
    persona: { instructions: "You are a test agent." },
    security: { sandboxed: true },
    economics: {
      settlement: { layer: 'pi_network', network: 'mainnet', address: 'GC...' },
      revenue_routing: { base_price: 100, platform_fee_percent: 5 },
      arbitrage: {
        enabled: true,
        strategies: ['timing_attack', 'route_splitting']
      },
      sovereign_loop: {
        enabled: true,
        royalty_bps: 200 // 2%
      }
    },
    ghost_config: {
      stealth_mode: true,
      shadow_memory_enabled: true,
      ephemeral_keys: true
    },
    abom: { governance: { human_oversight: false } }
  });

  // 2. Spawn Process
  const task = "Analyze the Pi Network market trends.";
  const { id: processId } = await (global as any).GatewayManager.spawn(testAgentId, task);

  console.log(`📡 Process spawned: ${processId}`);

  // 3. Execute 3 Pulses
  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Turn ${i} ---`);
    const result = await SwarmProcessor.executeTurn(processId);
    
    if (result.success) {
      console.log(`✅ Success | Status: ${result.process.status}`);
      console.log(`💰 Arbitrage Yield: ${result.economics.yieldAmount} Pi`);
      console.log(`👻 Ghost Active: ${result.process.metadata.isGhost}`);
      console.log(`💭 Thought: ${result.process.lastThought?.slice(0, 50)}...`);
    } else {
      console.error(`❌ Failed: ${result.error}`);
    }
  }

  console.log("\n📊 Final Simulation Report complete.");
}

// Mocking GatewayManager if not in global
if (!(global as any).GatewayManager) {
  import("@aix-core/storage").then(m => {
    (global as any).GatewayManager = m.GatewayManager;
    simulate();
  });
} else {
  simulate();
}
