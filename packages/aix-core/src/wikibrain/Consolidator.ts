import { kv } from '../storage/adapter';
import { getTrustChain } from '../trust-chain';
import { SemanticIndex } from './SemanticIndex';
import { LLMProvider } from '../llm-provider';

/**
 * AIX Wisdom Consolidator - The Alchemist
 * Converts raw logs into Topological Wisdom.
 * Made with Moe Abdelaziz
 */
export class WisdomConsolidator {
  private semanticIndex = new SemanticIndex();

  constructor(private llm: LLMProvider) {}

  async consolidate(agentId: string): Promise<void> {
    console.log(`🧬 Consolidating wisdom for agent: ${agentId}`);
    
    // 1. Fetch current logs + Historical Backups
    const trustChain = getTrustChain();
    let logs = trustChain.getChain().filter(entry => entry.agentId === agentId);
    
    // BACKUP LEARNING: Fetch historical failures from Redis
    const historyKey = `history:failures:${agentId}`;
    const historicalFailures = await kv.lrange<any>(historyKey, 0, 10);
    
    if (logs.length < 5 && historicalFailures.length === 0) {
      console.log('   ⏭️ Not enough data (current or historical) to distill wisdom yet.');
      return;
    }

    // Combine current state with historical "scar tissue"
    const contextData = {
      recent: logs.slice(-10),
      historical_scars: historicalFailures
    };

    // 2. Synthesize Wisdom (The Alchemical Process)
    const prompt = `
      Analyze the following execution context for Agent "${agentId}".
      
      Recent Logs:
      ${JSON.stringify(contextData.recent, null, 2)}
      
      Historical Failures (Backups):
      ${JSON.stringify(contextData.historical_scars, null, 2)}
      
      Task:
      1. Contrast recent performance with historical failures. Is the agent improving?
      2. Extract a "Survival Lesson" from the oldest mistakes.
      3. Distill a "Topological Wisdom" that ensures these mistakes never repeat.
      
      Output Format:
      Analysis: [improvement status]
      ScarLesson: [learning from old mistakes]
      FinalWisdom: [The concentrated rule for future agents]
    `;

    const synthesis = await this.llm.complete(prompt);
    console.log('✨ Wisdom Synthesized (with Historical Context):', synthesis);

    // 3. Index in WikiBrain
    const wisdomId = `wisdom:${agentId}:${Date.now()}`;
    await this.semanticIndex.index(wisdomId, 'wisdom', synthesis, {
      agentId,
      source: 'meta-loop-consolidation',
      visibility: 'public'
    });

    // 4. Create Topological Link (Community Building)
    // Link this wisdom to the agent's identity node
    await kv.sadd(`topology:links:${agentId}`, wisdomId);
    
    console.log(`✅ Wisdom grafted and linked: ${wisdomId}`);
  }
}
