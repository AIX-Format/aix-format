import { Redis } from "@upstash/redis";

/**
 * AIX Unified Storage Adapter — Studio local copy
 * Mirrors core/storage/redis.ts so apps/studio builds self-contained
 * on Vercel without depending on monorepo root files.
 */

export interface StorageOptions {
  ex?: number;
  px?: number;
  nx?: boolean;
  xx?: boolean;
}

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: StorageOptions): Promise<void>;
  del(key: string | string[]): Promise<void>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export const NS = {
  SESSION: "aix:session",
  REGISTRY: "aix:registry",
  ABOM: "aix:abom:cache",
  RATE: "aix:rate:limit",
  REVENUE: "aix:revenue:quota",
} as const;

export const TTL = {
  SESSION: 3600,
  ABOM_CACHE: 86400,
  RATE_WINDOW: 60,
} as const;

class UpstashRedisAdapter implements StorageAdapter {
  private client: Redis;

  constructor() {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      console.warn(
        "[Storage] Missing Upstash Redis credentials. Storage operations will fail."
      );
    }
    this.client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.client.get<T>(key);
    } catch (error) {
      console.error(`[Storage] GET failed for ${key}:`, error);
      return null;
    }
  }

  async set(
    key: string,
    value: unknown,
    options?: StorageOptions
  ): Promise<void> {
    try {
      await this.client.set(key, value, options as Record<string, unknown>);
    } catch (error) {
      console.error(`[Storage] SET failed for ${key}:`, error);
      throw error;
    }
  }

  async del(key: string | string[]): Promise<void> {
    try {
      await this.client.del(...(Array.isArray(key) ? key : [key]));
    } catch (error) {
      console.error(`[Storage] DEL failed for ${key}:`, error);
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`[Storage] INCR failed for ${key}:`, error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error(`[Storage] DECR failed for ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`[Storage] EXPIRE failed for ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.client.exists(key);
      return count > 0;
    } catch (error) {
      console.error(`[Storage] EXISTS failed for ${key}:`, error);
      return false;
    }
  }
}

export const kv = new UpstashRedisAdapter();
export default kv;
