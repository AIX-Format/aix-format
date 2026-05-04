/**
 * AIX Core - Main Entry Point
 * Exports all core components for the 4-Ring Bus Architecture
 */

// Gateway - Central orchestration
export {
  Gateway,
  getGateway,
  resetGateway,
  type AgentAction,
  type ActionResult,
  type SpawnConfig,
  type SpawnResult,
  type PaymentResult
} from './gateway';

// ExpectationEngine - Task monitoring
export {
  ExpectationEngine,
  getExpectationEngine,
  resetExpectationEngine,
  type Expectation
} from './expectation-engine';

// TrustChain - Signature verification
export {
  TrustChain,
  getTrustChain,
  resetTrustChain,
  type SignatureData,
  type LineageRecord
} from './trust-chain';

// Bus - 4-Ring event bus
export {
  Bus,
  getBus,
  resetBus,
  waitForEvent,
  type BusEvent,
  type BusEventType,
  type BusSubscription
} from './bus';

// AIX - Main API function
export { aix, type AixOptions, type AixResult, type SwarmPattern, type AixSwarmOptions } from './aix';

// Sentinel - Self-improvement engine
export { AxiomSentinel, sentinel } from './sentinel';

/**
 * Initialize all core components
 * Made with Moe Abdelaziz
 */
export async function initializeCore() {
  const { getGateway } = await import('./gateway');
  const { getExpectationEngine } = await import('./expectation-engine');
  const { getTrustChain } = await import('./trust-chain');
  const { getBus } = await import('./bus');
  const { sentinel } = await import('./sentinel');

  const gateway = getGateway();
  const expectationEngine = getExpectationEngine();
  const trustChain = getTrustChain();
  const bus = getBus();
  
  // Start the self-improvement watcher
  await sentinel.start();

  return {
    gateway,
    expectationEngine,
    trustChain,
    bus,
    sentinel
  };
}

/**
 * Reset all core components (for testing)
 */
export async function resetCore() {
  const { resetGateway } = await import('./gateway');
  const { resetExpectationEngine } = await import('./expectation-engine');
  const { resetTrustChain } = await import('./trust-chain');
  const { resetBus } = await import('./bus');

  resetGateway();
  resetExpectationEngine();
  resetTrustChain();
  resetBus();
}

// Built with Moe Abdelaziz — AIX Sovereign Infrastructure v2.1
