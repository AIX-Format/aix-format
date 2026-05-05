import { EventEmitter } from 'events';
import { kv, KEYS } from './storage';
import { health } from './health';
import { CuriosityEngine } from './curiosity';
import { archiveWisdom } from './brain';
import { runTask } from './agent-runtime';
import { GroqProvider } from './llm-provider';
import { mcpGate } from './mcp-gate';
import { SwarmRouter } from './swarm';
import { SovereignEconomics } from './economics';
import { getRustBridge } from '../../aix-rust-core/src/bridge';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

export * from './rate-limit';
export * from './harness.config';
export * from './economics';
export * from './gateway';

/**
 * 🛰️ AIX GATEWAY
 * The Sovereign Entry Point and Meta-Loop Orchestrator.
 * Made with Moe Abdelaziz
 */

export class Gateway extends EventEmitter {
  private octokit?: Octokit;
  private langfuse: any = null;
  private economics = new SovereignEconomics();
  private rust = getRustBridge();

  constructor(config: { githubToken?: string; langfuse?: any } = {}) {
    super();
    if (config.githubToken) {
      this.octokit = new Octokit({ auth: config.githubToken });
    }
    this.langfuse = config.langfuse;
  }

  /**
   * Primary execution gate for agents.
   * Ensures safety, integrity, and manages the meta-loop.
   */
  async run(agentId: string, taskDescription: string, force = false, userId: string = 'anonymous') {
    const startTime = Date.now();

    // 1. Publish start event to Rust Event Store
    await this.rust.eventStore.publish({
      id: crypto.randomUUID(),
      agent_id: agentId,
      event_type: 'task:start',
      payload: JSON.stringify({ task: taskDescription, userId }),
      timestamp: startTime,
    });

    console.log(`🚀 [Gateway] Initiating execution for ${agentId}`);

    // ⚡ [Conditional Evolution Trick]
    // Skip if run too frequently to save API costs and prevent oscillation.
    const lastRun = (await kv.get<number>(KEYS.agentLastActivity(agentId))) || 0;
    const hoursSince = (Date.now() - lastRun) / 3600000;
    
    if (hoursSince < 6 && !force) {
      console.log(`🛰️ [Gateway] Skipping evolution for ${agentId} (${hoursSince.toFixed(1)}h since last run)`);
      return { success: true, skipped: true, reason: 'Cool-down active' };
    }

    try {
      // 1. Guardian Pre-flight Clearance
      await health.checkIntegrity();
      const safetyScore = await health.getTrustScore(agentId);
      console.log(`🛡️ [Guardian] Safety Score for ${agentId}: ${safetyScore.toFixed(1)}`);
      
      await mcpGate({ tool: 'gateway.run', params: { taskDescription } }, agentId);

      if (await health.detectOscillation(agentId)) {
        console.warn(`⚠️ [Gateway] Oscillation detected for ${agentId}. Stabilizing...`);
        this.emit('gateway:stabilizing', { agentId });
        await health.decrementTrust(agentId, 0.1);
      }

      // 2. Routing & Model Selection
      const router = new SwarmRouter();
      const model = await router.getDecisionModel(taskDescription);
      
      // 3. Execution
      const result = await runTask(agentId, 'sovereign-agent', {
        taskId: `task-${Date.now()}`,
        description: taskDescription,
        maxSteps: 7
      }, {
        llm: new GroqProvider(process.env.GROQ_API_KEY!, model),
        tools: {} // Tool discovery would go here
      });

      const reward = await CuriosityEngine.calculateReward(agentId, taskDescription);
      console.log(`💰 [Settlement] Learning Reward: ${reward.toFixed(4)}`);
      await health.incrementTrust(agentId, reward * 0.05);

      // 5. FoldTrace Economic Settlement (Real 402)
      const cost = 0.005; // Base invocation cost in PI
      await this.economics.settleTask(agentId, userId, cost);

      if (result.success && result.result && result.result.length > 50) {
        console.log(`🧠 [WikiBrain] Archiving wisdom for ${agentId}`);
        await archiveWisdom(agentId, taskDescription, result.result, this.octokit);
      }

      // Update activity
      await kv.set(KEYS.agentLastActivity(agentId), Date.now());

      this.emit('agent:completed', { agentId, result });

      // 6. Audit Success
      await this.rust.eventStore.publish({
        id: crypto.randomUUID(),
        agent_id: agentId,
        event_type: 'task:success',
        payload: JSON.stringify({ duration: Date.now() - startTime }),
        timestamp: Date.now(),
      });

      return result;

    } catch (error: any) {
      console.error(`❌ [Gateway] Execution FAILED for ${agentId}:`, error);
      await health.decrementTrust(agentId, 0.5);
      this.emit('gateway:error', { agentId, error });
      
      // 7. Audit Failure
      await this.rust.eventStore.publish({
        id: crypto.randomUUID(),
        agent_id: agentId,
        event_type: 'task:failure',
        payload: JSON.stringify({ error: error.message }),
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  // --- PRIVATE HELPERS ---

  private async injectSovereigntyReminder(agentId: string): Promise<void> {
    await kv.set(KEYS.agentAutonomy(agentId), 1.0);
    this.emit('agent:sovereignty:reset', { agentId });
  }

  private async emitState(event: string, message: string): Promise<void> {
    this.emit(event, { message, timestamp: Date.now() });
  }
}
