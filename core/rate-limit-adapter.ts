import { kv } from '@vercel/kv';

/**
 * KVTokenBucket
 * 
 * A Vercel KV-backed token bucket implementation for distributed rate limiting.
 * Uses atomic Redis operations to prevent race conditions in serverless environments.
 */
export class KVTokenBucket {
  private capacity: number;
  private windowMs: number;

  /**
   * @param capacity Total number of tokens allowed in the window
   * @param windowMs Time window in milliseconds
   */
  constructor(capacity: number, windowMs: number) {
    this.capacity = capacity;
    this.windowMs = windowMs;
  }

  /**
   * Attempts to consume tokens for a given key.
   * Atomic using Redis DECRBY + ROLLBACK pattern.
   * 
   * @param key The identifier for the rate limit bucket
   * @param tokens Number of tokens to consume
   * @returns Promise<boolean> True if tokens were consumed, false otherwise
   */
  async consume(key: string, tokens: number = 1): Promise<boolean> {
    const kvKey = `aix:bucket:${key}`;
    try {
      // 1. Initialize if not exists (Atomic via SETNX)
      // Note: @vercel/kv set() with nx: true is equivalent to SETNX
      await kv.set(kvKey, this.capacity, { ex: Math.floor(this.windowMs / 1000), nx: true });

      // 2. Atomic decrement
      const remaining = await kv.decrby(kvKey, tokens);

      if (remaining < 0) {
        // 3. Rollback if over limit
        await kv.incrby(kvKey, tokens);
        return false;
      }
      return true;
    } catch (error) {
      console.error("[KVTokenBucket] Error accessing Vercel KV:", error);
      return true; // Fail-open per protocol
    }
  }

  /**
   * Resets the bucket for a given key.
   */
  async reset(key: string): Promise<void> {
    await kv.del(`aix:bucket:${key}`);
  }
}

