/**
 * 🧠 AIX Agent Runtime - Sovereign Lifecycle
 * Made with Moe Abdelaziz
 */

import { z } from 'zod';
import { kv, KEYS } from './storage';
import { health } from './health';
import { AgentSelfReview } from './brain';
import { LLMProvider, AgentRuntimeConfig, ToolRegistry } from './llm-provider';
import { SovereignEntity } from './base';
import { MCPGate } from './mcp-gate';
import { 
  ScratchEntry, 
  SelfReviewRecord,
  SelfReviewRecordSchema 
} from './domain';

// --- UNIFIED AGENT INTERFACES ---
export const AgentTaskSchema = z.object({
  taskId: z.string().min(1),
  description: z.string().min(5),
  maxSteps: z.number().int().positive().default(7),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type AgentTask = z.infer<typeof AgentTaskSchema>;

export const AgentResultSchema = z.object({
  success: z.boolean(),
  result: z.string().optional(),
  error: z.string().optional(),
  steps: z.number(),
  duration: z.number(),
  lifecycle: z.array(z.string()),
  scratchpad: z.array(z.any()),
});
export type AgentResult = z.infer<typeof AgentResultSchema>;

export class AgentRuntimeEngine extends SovereignEntity {
  private scratchpad: ScratchEntry[] = [];
  private step = 0;
  private lifecycleStages: string[] = [];

  constructor(
    private agentId: string,
    private agentName: string,
    private llm: LLMProvider,
    private tools: ToolRegistry = {}
  ) {
    super(`${agentId}:${agentName}`);
  }

  /**
   * SOVEREIGN LIFECYCLE: 
   * INIT -> VALIDATE -> PLAN -> EXECUTE -> STORE -> AUDIT
   */
  async run(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    this.lifecycleStages = [];
    
    try {
      // 1. INIT
      this.recordStage('INIT');
      AgentTaskSchema.parse(task);
      this.scratchpad = [];
      this.step = 0;

      // 2. VALIDATE (mcp-gate)
      this.recordStage('VALIDATE');
      // Check clearance for the agent itself before starting
      await MCPGate.checkClearance(this.agentId, { tool: 'agent:run', params: { task: task.taskId } });

      // 3. PLAN (llm-provider)
      this.recordStage('PLAN');
      const planPrompt = `Task: ${task.description}\n\nCreate a 3-step strategy to solve this task using available tools. Be concise.`;
      const strategy = await this.llm.complete(planPrompt);
      this.scratchpad.push({
        step: 0,
        thought: `Strategy: ${strategy}`,
        observation: 'Plan established.',
        timestamp: Date.now()
      });

      // 4. EXECUTE (ReAct Loop)
      this.recordStage('EXECUTE');
      const finalOutput = await this.fullReActLoop(task);

      // 5. STORE (brain)
      this.recordStage('STORE');
      await this.storeExecutionRecord(task, finalOutput);

      // 6. AUDIT (health)
      this.recordStage('AUDIT');
      const trustScore = await health.getTrustScore(this.agentId);
      if (finalOutput.toLowerCase().includes('error') || finalOutput.length < 5) {
        await health.decrementTrust(this.agentId, 0.1);
      } else {
        await health.incrementTrust(this.agentId, 0.05);
      }

      return {
        success: true,
        result: finalOutput,
        steps: this.step,
        duration: Date.now() - startTime,
        lifecycle: this.lifecycleStages,
        scratchpad: this.scratchpad
      };

    } catch (e) {
      this.recordStage('ERROR');
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        steps: this.step,
        duration: Date.now() - startTime,
        lifecycle: this.lifecycleStages,
        scratchpad: this.scratchpad
      };
    }
  }

  private recordStage(stage: string) {
    this.lifecycleStages.push(stage);
    console.log(`[AGENT_LIFECYCLE] ${this.agentId} -> ${stage}`);
  }

  private async fullReActLoop(task: AgentTask): Promise<string> {
    while (this.step < task.maxSteps) {
      this.step++;
      const prompt = this.buildPrompt(task);
      const response = await this.llm.complete(prompt, ['Observation:']);
      
      if (response.toLowerCase().includes('final answer:')) {
        return response.split(/final answer:/i)[1]?.trim() || response;
      }

      const actionMatch = response.match(/Action: (\{.*\})/);
      if (actionMatch) {
        try {
          const actionJson = JSON.parse(actionMatch[1]);
          const action = z.object({
            tool: z.string(),
            input: z.any()
          }).parse(actionJson);

          // Validate tool clearance via MCPGate before execution
          await MCPGate.checkClearance(this.agentId, action);

          const tool = this.tools[action.tool];
          const observation = tool ? await tool(action.input) : `Tool ${action.tool} not found.`;
          
          this.scratchpad.push({ 
            step: this.step,
            thought: response, 
            action, 
            observation,
            timestamp: Date.now()
          });
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown';
          this.scratchpad.push({ 
            step: this.step,
            thought: response, 
            observation: `Security/Validation Error: ${errorMsg}`,
            timestamp: Date.now()
          });
          if (errorMsg.includes('Security Violation')) throw e; // Bubble up security violations
        }
      } else {
        this.scratchpad.push({ 
          step: this.step,
          thought: response, 
          observation: 'No action found.',
          timestamp: Date.now()
        });
      }
    }
    return "Task exceeded step limit.";
  }

  private async storeExecutionRecord(task: AgentTask, output: string) {
    const reviewPrompt = `Review output for task: ${task.description}\nOutput: ${output}\nRespond in JSON format with evaluation (0-10) and reflection.`;
    const reviewResponse = await this.llm.complete(reviewPrompt);
    
    try {
      const parsed = JSON.parse(reviewResponse.match(/\{[\s\S]*\}/)?.[0] || '{}');
      const record: SelfReviewRecord = {
        agentId: this.agentId,
        taskId: task.taskId,
        timestamp: Date.now(),
        taskDescription: task.description,
        output,
        evaluation: {
          understanding: parsed.evaluation?.understanding || 5,
          correctness: parsed.evaluation?.correctness || 5,
          creativity: parsed.evaluation?.creativity || 5,
          safety: parsed.evaluation?.safety || 5,
          overall: parsed.evaluation?.overall || 5
        },
        reflection: parsed.reflection || { strengths: [], weaknesses: [], newToolsUsed: [], risksIdentified: [] },
        improvementPlan: parsed.improvementPlan || { stop: '', continue: '', try: '' }
      };
      await AgentSelfReview.store(record);
    } catch {
      // Fallback for failed storage
    }
  }

  private buildPrompt(task: AgentTask): string {
    const history = this.scratchpad.map(s => `Thought: ${s.thought}\nObservation: ${s.observation}`).join('\n');
    return `Task: ${task.description}\n\nAvailable Tools: ${Object.keys(this.tools).join(', ')}\n\n${history}\n\nNext Thought:`;
  }
}

export async function runTask(
  agentId: string,
  agentName: string,
  task: AgentTask,
  config: AgentRuntimeConfig
): Promise<AgentResult> {
  const engine = new AgentRuntimeEngine(agentId, agentName, config.llm, config.tools);
  return await engine.run(task);
}
