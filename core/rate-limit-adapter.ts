import { kv } from '@vercel/kv';

/**
 * KVTokenBucket
 * 
 * A Vercel KV-backed token bucket implementation for distributed rate limiting.
 * This ensures that rate limits are enforced across multiple serverless instances.
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
   * 
   * @param key The identifier for the rate limit bucket (e.g., user ID, IP)
   * @param tokens Number of tokens to consume (default: 1)
   * @returns Promise<boolean> True if tokens were consumed, false otherwise
   */
  async consume(key: string, tokens: number = 1): Promise<boolean> {
    const kvKey = `tb:${key}`;
    try {
      const current = await kv.get<number>(kvKey) ?? this.capacity;
      
      if (current < tokens) {
        return false;
      }

      const remaining = current - tokens;
      
      // Set the new value with an expiration matching the window
      // Note: This is a simple implementation. For production, 
      // you might want a Lua script to ensure atomicity.
      await kv.set(kvKey, remaining, { ex: Math.floor(this.windowMs / 1000) });
      
      return true;
    } catch (error) {
      console.error("[KVTokenBucket] Error accessing Vercel KV:", error);
      // Fallback: allow request in case of KV failure (fail-open)
      // or implement an in-memory fallback.
      return true; 
    }
  }

  /**
   * Resets the bucket for a given key.
   */
  async reset(key: string): Promise<void> {
    await kv.del(`tb:${key}`);
  }
}
