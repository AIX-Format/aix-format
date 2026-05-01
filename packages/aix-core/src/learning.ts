import { kv, KEYS } from './index';

/**
 * AIX Hermes Learning Engine
 * Implements Layer 2 (Skill Memory) by extracting successful procedures from agent runs.
 */

export interface ProcedureStep {
  tool: string;
  input: any;
  output: any;
  success: boolean;
}

export interface LearnedProcedure {
  goal: string;
  steps: ProcedureStep[];
  timestamp: number;
}

/**
 * Records a successful run as a 'Learned Skill'.
 * In the Hermes model, we don't save what happened, we save what worked.
 */
export async function recordSuccessfulProcedure(
  agentId: string, 
  goal: string, 
  steps: ProcedureStep[]
): Promise<void> {
  const key = KEYS.memSkill(agentId);
  
  const procedure: LearnedProcedure = {
    goal,
    steps: steps.filter(s => s.success), // Only save the successful steps
    timestamp: Date.now()
  };

  // Push to a set of learned skills or a list of procedures
  // For now, we'll use a list to maintain history of improvements
  await kv.lpush(key, JSON.stringify(procedure));
  
  // Keep only the top 20 most recent successful procedures to avoid bloat
  await kv.ltrim(key, 0, 19);
  
  console.log(`[Hermes] Learned new procedure for ${agentId}: "${goal}"`);
}

/**
 * Retrieves learned procedures for an agent to be used as 'few-shot' context or specific skills.
 */
export async function getLearnedProcedures(agentId: string): Promise<LearnedProcedure[]> {
  const key = KEYS.memSkill(agentId);
  const data = await kv.lrange<string>(key, 0, -1);
  return data.map(d => JSON.parse(d));
}

/**
 * Episodic Memory: Pattern Recognition
 * Placeholder for long-term pattern extraction (Layer 4).
 */
export async function updateEpisodicMemory(agentId: string, pattern: string): Promise<void> {
  const key = KEYS.memEpisodic(agentId);
  await kv.sadd(key, pattern);
}
