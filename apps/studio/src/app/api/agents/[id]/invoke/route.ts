import { kv, KEYS, NS } from '@/lib/redis';
import { NextResponse } from 'next/server';
import { getLearnedProcedures, recordSuccessfulProcedure } from '@aix-core/storage';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * AIX Sovereign Invocation Engine (AgenticKit + Hermes + Critic)
 */

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message, context, sessionId, skipCritic = false } = await req.json();
    const agentId = params.id;

    // 1. Fetch Agent Manifest
    const agentData = await kv.get<any>(KEYS.registry(agentId));
    if (!agentData) {
      return NextResponse.json({ error: 'Agent not found in registry' }, { status: 404 });
    }

    // 2. Retrieve Layer 2 Memory (Learned Skills/Procedures)
    const learnedSkills = await getLearnedProcedures(agentId);
    const skillContext = learnedSkills.length > 0 
      ? `Proven successful procedures for this agent:\n${JSON.stringify(learnedSkills.slice(0, 3))}`
      : "No previous successful procedures learned yet.";

    // 3. Revenue & Quota Check
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const routerResponse = await fetch(`${baseUrl}/api/mcp-router`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        agentDid: agentData.did || agentId,
        userId: sessionId || 'anonymous',
        endpointType: 'invoke'
      })
    });

    const routerResult = await routerResponse.json();
    if (!routerResult.success) {
      return NextResponse.json(routerResult, { status: routerResponse.status });
    }

    // 4. EXECUTION (Executor Agent)
    const systemPrompt = `
      ${agentData.persona?.instructions || 'You are a sovereign AI agent.'}
      
      HERMES MEMORY CONTEXT (SUCCESSFUL PATTERNS):
      ${skillContext}
      
      User Context: ${JSON.stringify(context || {})}
    `;

    const { text, finishReason, toolCalls } = await generateText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      prompt: message,
    });

    // 5. CRITIC PATTERN (Pattern 8: Agent reviews output)
    let isSuccess = finishReason === 'stop' || finishReason === 'tool-calls';
    let criticFeedback = null;

    if (isSuccess && !skipCritic) {
      const { text: feedback } = await generateText({
        model: google('gemini-2.0-flash-lite-preview'), // Lightweight critic
        system: "You are the AIX Protocol Critic. Review the agent's response for accuracy, safety, and goal achievement. Output only 'VALID' or 'INVALID' followed by a brief reason.",
        prompt: `User Goal: ${message}\nAgent Response: ${text}`
      });
      
      criticFeedback = feedback;
      if (feedback.includes('INVALID')) {
        isSuccess = false;
        console.warn(`[Critic] Run invalidated for ${agentId}: ${feedback}`);
      }
    }

    // 6. HERMES LEARNING: Save what worked (Validated by Critic)
    if (isSuccess) {
      void recordSuccessfulProcedure(agentId, message, [
        { 
          tool: toolCalls?.length ? 'tool_execution' : 'direct_response', 
          input: message, 
          output: text, 
          success: true 
        }
      ]);
    }

    // 7. Update Layer 1 Memory (Session)
    const memoryKey = KEYS.memory(agentId);
    void kv.lpush(memoryKey, JSON.stringify({ 
      role: 'user', 
      content: message, 
      timestamp: Date.now() 
    })).then(() => {
      kv.lpush(memoryKey, JSON.stringify({ 
        role: 'assistant', 
        content: text, 
        timestamp: Date.now(),
        critic: criticFeedback
      }));
      kv.ltrim(memoryKey, 0, 49);
    });

    return NextResponse.json({
      success: true,
      response: text,
      critic: criticFeedback,
      billing: routerResult,
      learned: isSuccess
    });
  } catch (err: any) {
    console.error("[Invoke Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
