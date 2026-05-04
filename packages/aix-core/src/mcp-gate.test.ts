import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mcpGate, abomScanner } from './mcp-gate'
import * as mcpGateModule from './mcp-gate'
import { trustChain } from './trust-chain/index'

describe('MCP Gate', () => {
  const agentDid = 'did:axiom:test-agent'
  const toolCall = { tool: 'test_tool', params: { x: 1 } }

  beforeEach(() => {
    trustChain.clear()
    vi.restoreAllMocks()
  })

  it('should auto-block if score < 5', async () => {
    vi.spyOn(abomScanner, 'getSafetyScore').mockResolvedValue(4)

    await expect(mcpGate(toolCall, agentDid)).rejects.toThrow('safetyScore 4 below minimum threshold')
    
    const lastEntry = trustChain.getChain().at(-1)
    expect(lastEntry?.action).toBe('mcp.auto_blocked')
    expect(lastEntry?.actor_did).toBe(agentDid)
  })

  it('should throw if score 5-7 and human rejects', async () => {
    vi.spyOn(abomScanner, 'getSafetyScore').mockResolvedValue(6)
    vi.spyOn(mcpGateModule, 'requestHumanApproval').mockResolvedValue(false)

    await expect(mcpGate(toolCall, agentDid)).rejects.toThrow('Human rejected this tool call')
    
    const chain = trustChain.getChain()
    expect(chain.some(e => e.action === 'mcp.human_rejected')).toBe(true)
  })

  it('should succeed if score 5-7 and human approves', async () => {
    vi.spyOn(abomScanner, 'getSafetyScore').mockResolvedValue(6)
    vi.spyOn(mcpGateModule, 'requestHumanApproval').mockResolvedValue(true)

    const result = await mcpGate(toolCall, agentDid)
    
    expect(result.success).toBe(true)
    const chain = trustChain.getChain()
    expect(chain.some(e => e.action === 'mcp.human_approved')).toBe(true)
    expect(chain.some(e => e.action === 'mcp.executed')).toBe(true)
  })

  it('should succeed immediately if score >= 7', async () => {
    vi.spyOn(abomScanner, 'getSafetyScore').mockResolvedValue(8)
    const approvalSpy = vi.spyOn(mcpGateModule, 'requestHumanApproval')

    const result = await mcpGate(toolCall, agentDid)
    
    expect(result.success).toBe(true)
    expect(approvalSpy).not.toHaveBeenCalled()
    
    const lastEntry = trustChain.getChain().at(-1)
    expect(lastEntry?.action).toBe('mcp.executed')
  })
})
