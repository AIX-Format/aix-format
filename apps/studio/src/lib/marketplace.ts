/**
 * AIX Marketplace & Skills Registry
 * Logic for MCP Tool Discovery, Plugin Management, and SaaS Integrations.
 */

import { AgentSkill, McpPrompt, KycTier } from '@aix-types';
import { kv } from './redis';

export interface MarketplaceItem {
  id: string;
  type: 'connector' | 'skill' | 'plugin' | 'agent';
  name: string;
  description: string;
  provider: string;
  tier: KycTier;
  price?: number;
  tags: string[];
  mcp_config?: {
    server_url?: string;
    tools?: AgentSkill[];
    prompts?: McpPrompt[];
  };
}

const MARKETPLACE_KEY = 'aix:marketplace:items';

/**
 * Registry for MCP-based skills and plugins.
 */
export class MarketplaceRegistry {
  /**
   * Registers a new item in the marketplace.
   */
  static async register(item: MarketplaceItem): Promise<boolean> {
    try {
      await kv.hset(MARKETPLACE_KEY, { [item.id]: JSON.stringify(item) });
      return true;
    } catch (error) {
      console.error('Marketplace registration failed:', error);
      return false;
    }
  }

  /**
   * Retrieves all items of a specific type.
   */
  static async listItems(type?: MarketplaceItem['type']): Promise<MarketplaceItem[]> {
    try {
      const items = await kv.hgetall(MARKETPLACE_KEY) || {};
      const parsed = Object.values(items).map((v) => JSON.parse(v as string));
      return type ? parsed.filter((i) => i.type === type) : parsed;
    } catch (error) {
      console.error('Marketplace list failed:', error);
      return [];
    }
  }

  /**
   * Finds an item by ID.
   */
  /**
   * Finds an item by ID.
   */
  static async getItem(id: string): Promise<MarketplaceItem | null> {
    try {
      const item = await kv.hget(MARKETPLACE_KEY, id);
      return item ? JSON.parse(item as string) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Retrieves an item with Signed Cache protection.
   */
  static async getWithCache(id: string): Promise<{ item: MarketplaceItem | null; signature?: string }> {
    try {
      const cached = await kv.get(`cache:marketplace:${id}`);
      if (cached) {
        const { data, signature } = JSON.parse(cached as string);
        return { item: data, signature };
      }
      const item = await this.getItem(id);
      return { item };
    } catch {
      return { item: null };
    }
  }

  /**
   * Caches an item with a signature.
   */
  static async setWithCache(item: MarketplaceItem, signature: string): Promise<void> {
    const payload = JSON.stringify({ data: item, signature });
    await kv.set(`cache:marketplace:${item.id}`, payload, { ex: 3600 }); // 1h TTL
  }
}

/**
 * SaaS Wrapper Pattern
 * Converts a standard REST API to an MCP-compatible connector.
 */
export async function createSaasWrapper(
  name: string,
  baseUrl: string,
  apiKey: string,
  endpoints: Array<{ name: string; path: string; method: string }>
): Promise<MarketplaceItem> {
  const tools: AgentSkill[] = endpoints.map((e) => ({
    name: e.name,
    description: `Calls ${e.method} ${e.path} on ${name}`,
    parameters: {
      type: 'object',
      properties: {
        body: { type: 'object' },
        params: { type: 'object' }
      }
    }
  }));

  const item: MarketplaceItem = {
    id: `connector-${name.toLowerCase()}`,
    type: 'connector',
    name: `${name} Connector`,
    description: `MCP-ready SaaS wrapper for ${name}`,
    provider: 'AIX Core',
    tier: 'basic',
    tags: ['saas', 'connector', name.toLowerCase()],
    mcp_config: {
      tools
    }
  };

  await MarketplaceRegistry.register(item);
  return item;
}
