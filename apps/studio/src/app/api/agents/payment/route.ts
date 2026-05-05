import { NextRequest, NextResponse } from 'next/server';
import { treasury } from '@aix-core';
import { requireAuth } from '@/lib/api-helpers';

/**
 * API: Agent Payment
 * ENTRY: HTTP Gate for Economics.
 * 
 * Thin wrapper over SovereignTreasury.
 * Made with Moe Abdelaziz
 */

export async function POST(request: NextRequest) {
  return requireAuth(async (session) => {
    try {
      const body = await request.json();
      const { agentId, amount, paymentMethod, currency = 'PI' } = body;
      
      const userId = session.user.id || 'anonymous';

      // Delegate to SovereignTreasury
      const settlement = await treasury.processPayment(agentId, {
        agentId,
        amount,
        currency,
        merchantId: 'axiom-platform',
        userId,
        rail: paymentMethod // Map frontend names to rails if needed
      });

      return NextResponse.json(settlement, { status: 201 });

    } catch (error: any) {
      console.error('[API:Payment] Processing failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Payment processing failed' 
      }, { status: 500 });
    }
  });
}

export async function GET(request: NextRequest) {
  // Treasury history retrieval
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  
  if (!agentId) return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });

  const { kv } = await import('@aix-core');
  const history = await kv.lrange(`treasury:history:${agentId}`, 0, 49);
  
  return NextResponse.json(history.map((h: any) => JSON.parse(h)));
}

// Made with Moe Abdelaziz
