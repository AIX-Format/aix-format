import { Gateway } from '../packages/aix-core/src/gateway';

async function runChaosTest() {
  const gateway = new Gateway();
  console.log('🚀 Starting Chaos Test Round 54...');

  // 1. Simulate Loss
  const criticalPath = './packages/aix-core/docs/UNIFIED_BOM_SPEC.md';
  console.log(`[Chaos] Simulating loss of ${criticalPath}`);

  // 2. Trigger Monitor
  // We mock the failure in the test context
  await gateway.monitorPathIntegrity([criticalPath]);

  // 3. Verify Gearbox
  const currentGear = gateway.getSovereignGear('security_repair');
  console.log(`[Status] Current Sovereign Gear: ${currentGear}`);

  if (currentGear === 'SOVEREIGN') {
    console.log('✅ PASS: System shifted to high-security mode.');
  } else {
    console.log('❌ FAIL: System remained in Turbo mode during crisis.');
  }
}

runChaosTest();
