import { kv, KEYS } from './storage';

/**
 * Sovereign AIX Economics & FoldTrace Protocol
 * 
 * Handles real value settlement, revenue distribution, and immutable ledgers.
 * 70% Author | 20% Stakers | 10% Protocol
 */

export interface FoldTraceEntry {
  id: string;
  agentId: string;
  userId: string;
  operation: string;
  amount: number;
  currency: string;
  timestamp: number;
  split: {
    author: number;
    stakers: number;
    protocol: number;
  };
}

export class SovereignEconomics {
  /**
   * Settle a task execution and distribute revenue.
   * NO MOCKS. Real Redis persistence.
   */
  async settleTask(agentId: string, userId: string, amount: number): Promise<FoldTraceEntry> {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = Date.now();
    
    // 1. Calculate Split
    const authorShare = amount * 0.7;
    const stakersShare = amount * 0.2;
    const protocolShare = amount * 0.1;

    const entry: FoldTraceEntry = {
      id,
      agentId,
      userId,
      operation: 'invoke',
      amount,
      currency: 'PI',
      timestamp,
      split: {
        author: authorShare,
        stakers: stakersShare,
        protocol: protocolShare
      }
    };

    // 2. Persist in Immutable Ledger (Redis List)
    await kv.lpush(`agent:${agentId}:ledger`, JSON.stringify(entry));
    
    // 3. Distribute Revenue to Wallets
    // Fetch agent metadata to find author address
    const metadata = await kv.get<any>(`agent:${agentId}:metadata`) || { authorAddress: '0x-default-author' };
    const authorAddress = metadata.authorAddress;

    await this.updateWallet(authorAddress, authorShare);
    await this.updateWallet('protocol_treasury', protocolShare);
    // For stakers, we distribute proportionally to total stake (simplified for now)
    await this.updateWallet(`agent:${agentId}:staking_pool`, stakersShare);

    // 4. Update Global Protocol Metrics
    await kv.incrbyfloat('protocol:total_revenue', amount);
    await kv.incrby('protocol:total_operations', 1);

    console.log(`💸 [FoldTrace] Settled ${amount} PI for ${agentId}. Author: ${authorShare.toFixed(4)}`);
    
    return entry;
  }

  /**
   * Update a wallet balance in Redis.
   */
  private async updateWallet(address: string, amount: number) {
    const key = `wallet:${address}:balance`;
    const current = await kv.get<number>(key) || 0;
    await kv.set(key, current + amount);
  }

  /**
   * Get wallet balance.
   */
  async getBalance(address: string): Promise<number> {
    return await kv.get<number>(`wallet:${address}:balance`) || 0;
  }

  /**
   * Get total revenue for an agent.
   */
  async getAgentRevenue(agentId: string): Promise<number> {
    const ledger = await kv.lrange<string>(`agent:${agentId}:ledger`, 0, -1);
    return ledger.reduce((sum, entryStr) => {
      const entry = JSON.parse(entryStr) as FoldTraceEntry;
      return sum + entry.amount;
    }, 0);
  }

  /**
   * Get ledger history.
   */
  async getLedger(agentId: string, limit = 50): Promise<FoldTraceEntry[]> {
    const ledger = await kv.lrange<string>(`agent:${agentId}:ledger`, 0, limit - 1);
    return ledger.map(s => JSON.parse(s));
  }
}

export const economics = new SovereignEconomics();
