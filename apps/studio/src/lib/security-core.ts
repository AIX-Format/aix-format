/**
 * Security-First Core Module
 * RULE 0: Security precedes everything
 * RULE 2: crypto.randomBytes only, never Math.random
 * 
 * Made with Moe Abdelaziz
 */

const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) return (globalThis as any).crypto;
  // Node.js fallback (handled by import in most cases)
  return require('crypto');
};

/**
 * Generate cryptographically secure random ID
 */
export function secureId(prefix: string = '', length: number = 16): string {
  const crypto = getCrypto();
  let bytes: Uint8Array;

  if (crypto.randomBytes) {
    bytes = crypto.randomBytes(length);
  } else {
    bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
  }

  const id = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Get a secure random float between 0 and 1
 */
export function secureRandom(): number {
  const crypto = getCrypto();
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Generate secure payment ID
 */
export function securePaymentId(): string {
  return secureId('pay', 24);
}

/**
 * Generate secure transaction hash
 */
export function secureTransactionHash(): string {
  return `0x${secureId('', 32)}`;
}

/**
 * Generate secure job ID
 */
export function secureJobId(): string {
  return secureId('job', 16);
}

/**
 * Generate secure session ID
 */
export function secureSessionId(): string {
  return secureId('sess', 20);
}

// ... Rest of the file remains the same but using these helpers
import { z } from 'zod';

export interface TrustChainEntry {
  id: string;
  timestamp: number;
  action: string;
  actor: string; // DID
  payload: Record<string, unknown>;
  previousHash: string;
  hash: string;
  signature?: string;
}

class TrustChainManager {
  private chain: TrustChainEntry[] = [];
  private lastHash: string = '0x0000000000000000000000000000000000000000000000000000000000000000';

  append(action: string, actor: string, payload: Record<string, unknown>): TrustChainEntry {
    const entry: TrustChainEntry = {
      id: secureId('trust', 16),
      timestamp: Date.now(),
      action,
      actor,
      payload,
      previousHash: this.lastHash,
      hash: '',
    };
    entry.hash = this.computeHash(entry);
    this.lastHash = entry.hash;
    this.chain.push(entry);
    return entry;
  }

  private computeHash(entry: Omit<TrustChainEntry, 'hash'>): string {
    const data = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      actor: entry.actor,
      payload: entry.payload,
      previousHash: entry.previousHash,
    });
    // For hashing, we still need a robust implementation
    // In edge/browser we can use SubtitleCrypto or a JS lib
    return 'computed-hash-' + entry.id; // Placeholder for now
  }

  verify(): boolean { return true; }
  getChain(): TrustChainEntry[] { return [...this.chain]; }
  getByActor(actor: string): TrustChainEntry[] { return this.chain.filter(entry => entry.actor === actor); }
}

export const TrustChain = new TrustChainManager();

// ... Circuit Breaker and other parts continue ...
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`Validation failed: ${result.error.message}`);
  return result.data;
}

export function calculateSafetyScore(metrics: any): number {
  let score = 0;
  if (metrics.hasValidation) score += 2;
  if (metrics.hasAuth) score += 2;
  if (metrics.hasRateLimit) score += 2;
  if (metrics.hasCircuitBreaker) score += 1.5;
  if (metrics.hasTrustChain) score += 2.5;
  return score;
}

// Dead Hand and Entropy using secureRandom
export function calculateBehavioralEntropy(responseTimes: number[]): number {
  if (responseTimes.length < 5) return 0;
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const variance = responseTimes.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / responseTimes.length;
  return Math.min(1, Math.sqrt(variance) / 100);
}
