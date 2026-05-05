import { NextResponse, NextRequest } from 'next/server';
import { registry } from '@aix-core';
import { requireAuth } from '@/lib/api-helpers';

/**
 * API: Agent Registration & Listing
 * ENTRY: HTTP Gate for Registry.
 * 
 * Thin wrapper over AgentRegistry.
 * Made with Moe Abdelaziz
 */

export async function POST(req: Request) {
  return requireAuth(async (session) => {
    try {
      const manifest = await req.json();
      const userId = session.user.id || 'default_user';

      const result = await registry.register(manifest, {
        userId,
        isShadow: !!manifest.is_shadow_clone
      });

      return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
      console.error('[API:Registry] Registration failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Registration failed' 
      }, { status: 400 });
    }
  });
}

export async function GET(req: NextRequest) {
  return requireAuth(async (session) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const userId = session.user.id || 'default_user';

      if (id) {
        const agent = await registry.getAgent(id);
        if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        return NextResponse.json(agent);
      }

      const agents = await registry.listUserAgents(userId);
      return NextResponse.json(agents);

    } catch (error: any) {
      console.error('[API:Registry] Listing failed:', error);
      return NextResponse.json({ 
        error: 'Failed to list agents' 
      }, { status: 500 });
    }
  });
}

// Made with Moe Abdelaziz
