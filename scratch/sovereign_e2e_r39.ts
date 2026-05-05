
import { runTask } from '../packages/aix-core/src/agent-runtime';
import { getTrustChain } from '../packages/aix-core/src/trust-chain';

async function runE2E() {
  console.log("🚀 [CHECKPOINT 1] Starting Sovereign E2E Round 39...");
  
  const task = {
    taskId: "e2e_r39_audit",
    description: "Perform a real-world audit of gateway.ts and check for hidden cognitive patterns. Verify if the code explains itself correctly to you."
  };

  try {
    console.log("📡 [CHECKPOINT 2] Calling runTask...");
    const result = await runTask(task);
    console.log("✨ [CHECKPOINT 3] E2E RESULT OBTAINED.");
    console.log("✨ FINAL OUTPUT:", result.result);
    
    const logs = await getTrustChain().getHistory();
    console.log("📜 [CHECKPOINT 4] TRUST_CHAIN LOGS COUNT:", logs.length);
    
    if (result.success && result.result.includes("[SOVEREIGN_TRUTH_REPORT]")) {
      console.log("✅ [CHECKPOINT 5] ROUND 39 SUCCESS: Truth synthesized.");
    } else {
      console.log("❌ [CHECKPOINT 5] ROUND 39 FAILED: Missing synthesis.");
    }
  } catch (e) {
    console.error("💥 [ERROR] E2E CRASHED:", e);
  }
}

runE2E().catch(console.error);
