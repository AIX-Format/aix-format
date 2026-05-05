import { NextResponse } from 'next/server';
import { health } from '@aix-core';

/**
 * GET /api/health
 * Returns system health via SovereignHealthService.
 * Made with Moe Abdelaziz
 */
export async function GET() {
  try {
    const report = await health.checkSystem();
    return NextResponse.json(report, { status: report.status === 'healthy' ? 200 : 503 });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}

// Made with Moe Abdelaziz
