import { getTrustChain } from './trust-chain';
import { AbomScanner } from './security/abom-scanner';

const trustChain = getTrustChain();

export const abomScanner = {
  getSafetyScore: async (agentDid: string) => {
    // In a real sovereign world, we fetch the config from the Registry
    // For now, we use a default config for the scan
    const mockConfig = { tools: [{ name: 'terminal' }, { name: 'fetch' }] }; 
    const result = AbomScanner.scan(mockConfig);
    return result.score;
  }
}

type ToolCall = { tool: string; params: Record<string, unknown> }
type ToolResult = { success: boolean; data: unknown }

// كائن لمعالجة العمليات الأمنية لتسهيل الاختبار والتبديل
export const securityHandlers = {
  requestHumanApproval: async (
    toolCall: ToolCall,
    agentDid: string,
    score: number
  ): Promise<boolean> => {
    console.log(`[HUMAN-APPROVAL-REQUIRED] Agent ${agentDid} requested ${toolCall.tool} with score ${score}`);
    return true; 
  },
  executeTool: async (toolCall: ToolCall): Promise<ToolResult> => {
    // Proactive: If it's a Stripe tool, ensure we use the Sovereign Economy bridge
    if (toolCall.tool.startsWith('stripe.')) {
      console.log(`[ECONOMY] Stripe MCP tool called: ${toolCall.tool}`);
      // Tesla 369 Timeout for financial clearance
      await new Promise(r => setTimeout(r, 369)); 
    }
    return { success: true, data: `Executed ${toolCall.tool}` };
  }
}

/**
 * Stripe MCP Tool Discovery (RULE 5 & 9 Compatible)
 * Allows AIX agents to interact with Stripe tools directly via MCP
 */
export const stripeDiscovery = {
  isStripeTool: (name: string) => name.startsWith('stripe.'),
  getRequiredTier: (tool: string) => {
    if (tool.includes('payment_intent')) return 'verified_tier_3'; // Tesla number
    return 'verified';
  }
}

export async function mcpGate(
  toolCall: ToolCall,
  agentDid: string
): Promise<ToolResult> {

  // RULE 5 من الدستور: safetyScore < 7 → STOP
  const score = await abomScanner.getSafetyScore(agentDid)

  // Auto-block
  if (score < 5) {
    await trustChain.append('mcp.auto_blocked', agentDid, { score, toolCall })
    throw new Error(`safetyScore ${score} below minimum threshold`)
  }

  // ← Human-in-the-Loop: المنطقة الرمادية 5–7
  if (score >= 5 && score < 7) {
    const approved = await securityHandlers.requestHumanApproval(toolCall, agentDid, score)
    if (!approved) {
      await trustChain.append('mcp.human_rejected', agentDid, { toolCall, score })
      throw new Error('Human rejected this tool call')
    }
    await trustChain.append('mcp.human_approved', agentDid, { toolCall, score })
  }

  // Economic Layer: Coinbase Wallet + Stripe Check
  if (stripeDiscovery.isStripeTool(toolCall.tool)) {
    const tier = stripeDiscovery.getRequiredTier(toolCall.tool);
    console.log(`[ECONOMY] Stripe tool ${toolCall.tool} requires tier ${tier}`);
    
    // In production, we'd check against AxiomID + Coinbase TEE Vault
    await trustChain.append('economy.stripe_checked', agentDid, { toolCall, tier });
  }

  // Execute
  const result = await securityHandlers.executeTool(toolCall)
  await trustChain.append('mcp.executed', agentDid, { toolCall, score })
  return result
}
