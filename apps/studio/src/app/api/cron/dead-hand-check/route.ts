import { NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { KEYS } from '@/lib/redis-keys';

export const runtime = 'edge';
export const maxDuration = 60;

/**
 * Dead Hand Protocol - Automated Health Check
 * 
 * Runs every 5 minutes via Vercel Cron
 * Checks all active agents for heartbeat timeout
 * Triggers freeze if agent is unresponsive
 */
export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active agents from registry
    const registryKeys = await kv.keys('agent:*');
    const agentIds = registryKeys
      .map(key => key.split(':')[1])
      .filter(id => id && !id.includes(':'));

    const results = {
      checked: 0,
      frozen: 0,
      healthy: 0,
      errors: [] as string[],
    };

    // Check each agent's heartbeat
    for (const agentId of agentIds) {
      try {
        results.checked++;
        
        const heartbeatKey = KEYS.heartbeat(agentId);
        const lastHeartbeat = await kv.get<number>(heartbeatKey);
        
        if (!lastHeartbeat) {
          // No heartbeat recorded yet - skip
          continue;
        }

        const now = Date.now();
        const timeSinceHeartbeat = now - lastHeartbeat;
        const DEAD_HAND_THRESHOLD = 90 * 1000; // 90 seconds

        if (timeSinceHeartbeat > DEAD_HAND_THRESHOLD) {
          // Agent is unresponsive - freeze it
          await kv.set(KEYS.frozen(agentId), {
            reason: 'Dead Hand Protocol triggered - no heartbeat',
            frozenAt: now,
            lastHeartbeat,
            timeSinceHeartbeat,
          });

          // Record incident
          await kv.lpush(KEYS.incident(agentId), {
            type: 'DEAD_HAND_FREEZE',
            timestamp: now,
            reason: 'Heartbeat timeout',
            timeSinceHeartbeat,
          });

          results.frozen++;
        } else {
          results.healthy++;
        }
      } catch (error: any) {
        results.errors.push(`${agentId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      results,
    });
  } catch (error: any) {
    console.error('[Dead Hand Check] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Made with Bob
