/**
 * RESONANCE ENGINE - Nikola Tesla's Frequency Matching
 * 
 * "If you want to find the secrets of the universe, 
 *  think in terms of energy, frequency and vibration."
 * 
 * Every agent has a NATURAL FREQUENCY - tasks they excel at.
 * When you match task frequency to agent frequency → performance amplifies.
 * 
 * This is NOT capability matching - it's RESONANCE matching.
 * Capability: "I can do it"
 * Resonance: "I was BORN to do it"
 */

import { kv } from './storage/adapter';

export interface AgentResonance {
  agentId: string;
  frequencies: Record<string, number>;  // task_type → resonance_score (0-1)
  peakFrequency: string;                // The ONE thing this agent excels at
  harmonics: string[];                  // Related tasks that also resonate
  amplification: number;                // Performance multiplier at peak (1.5-3x)
  lastUpdated: number;
}

export interface TaskPerformance {
  taskId: string;
  taskType: string;
  agentId: string;
  success: boolean;
  duration: number;        // milliseconds
  quality: number;         // 0-1 score
  timestamp: number;
}

export class ResonanceEngine {
  private static readonly PERFORMANCE_KEY = 'resonance:performance';
  private static readonly RESONANCE_KEY = 'resonance:agents';
  private static readonly MIN_SAMPLES = 3;  // Minimum tasks to compute resonance
  private static readonly DECAY_FACTOR = 0.95;  // Recent performance weighted more

  /**
   * Record task performance for resonance calculation
   */
  static async recordPerformance(performance: TaskPerformance): Promise<void> {
    const key = `${this.PERFORMANCE_KEY}:${performance.agentId}:${performance.taskType}`;
    
    await kv.lpush(key, JSON.stringify(performance));
    
    // Keep last 100 performances per agent-task pair
    await kv.ltrim(key, 0, 99);
    
    // Trigger resonance recomputation
    await this.computeResonance(performance.agentId);
  }

  /**
   * Compute agent's natural frequency from task history
   */
  static async computeResonance(agentId: string): Promise<AgentResonance> {
    const taskTypes = await this.getAgentTaskTypes(agentId);
    const frequencies: Record<string, number> = {};
    
    for (const taskType of taskTypes) {
      const resonance = await this.calculateTaskResonance(agentId, taskType);
      if (resonance > 0) {
        frequencies[taskType] = resonance;
      }
    }

    // Find peak frequency (highest resonance)
    let peakFrequency = '';
    let maxResonance = 0;
    
    for (const [taskType, resonance] of Object.entries(frequencies)) {
      if (resonance > maxResonance) {
        maxResonance = resonance;
        peakFrequency = taskType;
      }
    }

    // Find harmonics (similar frequencies within 20% of peak)
    const harmonics = Object.entries(frequencies)
      .filter(([type, res]) => type !== peakFrequency && res >= maxResonance * 0.8)
      .map(([type]) => type);

