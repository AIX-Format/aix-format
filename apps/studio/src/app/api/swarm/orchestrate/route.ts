import { NextRequest, NextResponse } from 'next/server';
import { PulseOrchestrator } from '@aix-core';

/**
 * API: Swarm Orchestration
 * EDGE: Simple parsing and core delegation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agents, task, coordinationStrategy } = body;

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'agents array required' }, { status: 400 });
    }

    const orchestrator = new PulseOrchestrator();
    const plan = await orchestrator.createPlan(agents, task, coordinationStrategy);
    
    return NextResponse.json({
      success: true,
      ...plan
    });
  } catch (error: any) {
    console.error('[API:Swarm] Orchestration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Made with Moe Abdelaziz
