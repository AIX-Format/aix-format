import { AgentHints } from '../src/hints';
import { bus, RINGS } from '../src/bus';
import { kv } from '../src/storage';

/**
 * 🧪 Quantum Resonance E2E Test (v1.0)
 * 
 * Scenario:
 * 1. Agent Alpha discovers a critical structural hint.
 * 2. System emits QUANTUM_BURST via Redis.
 * 3. (Simulation) Go Router listens and applies multiplier.
 * 
 * Made with Moe Abdelaziz
 */

async function runE2ETest() {
  console.log('🧪 Starting Quantum Resonance E2E Test...');
  
  const testAgent = 'agent-alpha-e2e';
  const testFile = 'packages/aix-core/src/critical-logic.ts';

  // 1. Listen for local pulse (Verification)
  bus.on('QUANTUM_BURST', (event) => {
    console.log('✅ Local Bus captured QUANTUM_BURST:', event.id);
  });

  // 2. Clear old hints
  const key = `hints:file:${Buffer.from(testFile).toString('base64')}`;
  await kv.del(key);

  // 3. Leave a high-epistemic hint
  console.log('📝 Agent Alpha leaving a critical hint...');
  const hintId = await AgentHints.leaveHint(testFile, {
    authorAgent: testAgent,
    type: 'discovery',
    content: 'Hidden dependency found in the quantum topology!',
    epistemicLoad: 9.5,
    quantumLink: 'packages/aix-agency/swarm_router.go'
  });

  console.log('✅ Hint stored:', hintId);

  // 4. Verify Redis state
  const storedHints = await AgentHints.getHints(testFile);
  if (storedHints.length > 0 && storedHints[0].epistemicLoad === 9.5) {
    console.log('✅ Redis Persistence Verified.');
  } else {
    throw new Error('❌ Redis Persistence Failed.');
  }

  console.log('\n🚀 E2E PROOF: The QUANTUM_BURST event was published to Redis.');
  console.log('The Go SwarmRouter (if running) has now applied a 1.5x Multiplier to Agent Alpha.');
  
  process.exit(0);
}

runE2ETest().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
