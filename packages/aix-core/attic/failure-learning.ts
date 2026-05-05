/**
 * AIX Failure Learning Engine
 * Learns from mistakes to prevent recurrence (RULE 6)
 * Made with Moe Abdelaziz
 */

import { kv } from '../storage/adapter';
import { KEYS } from '../storage/keys';
import { createHash } from 'crypto';
import { getBus } from '../bus';

export interface FailurePattern {
  patternId: string;
  agentId: string;
  taskId: string;
  error: string;
  context: any;
  timestamp: number;
}

export class FailureLearning {
  /**
   * Record a failure and generate a learning pattern
   */
  static async learn(agentId: string, taskId: string, error: string, context: any): Promise<void> {
    const timestamp = Date.now();
    const patternId = `fail_${createHash('md5').update(`${agentId}:${taskId}:${error}`).digest('hex').slice(0, 8)}`;

    const pattern: FailurePattern = {
      patternId,
      agentId,
      taskId,
      error,
      context,
      timestamp
    };

    // Store in Redis (RULE 6: Quantum Topology patterns)
    await kv.sadd(KEYS.agentFailurePatterns(agentId), JSON.stringify(pattern));

    // Emit event for Curiosity Engine to feed from failure
    const bus = getBus();
    await bus.emitEvent('agent:failure_learning', agentId, {
      patternId,
      error,
      severity: 'high'
    }, taskId);

    console.log(`[FailureLearning] New pattern recorded for ${agentId}: ${patternId}`);
  }

  /**
   * Retrieve failure patterns for an agent
   */
  static async getPatterns(agentId: string): Promise<FailurePattern[]> {
    const raw = await kv.smembers(KEYS.agentFailurePatterns(agentId));
    return raw.map(r => JSON.parse(r));
  }
}
