import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { pluginId } = await req.json();
    if (!pluginId) {
      return NextResponse.json({ error: 'pluginId required' }, { status: 400 });
    }
    // Phase 6: persist to Redis, trigger npm install, register tool
    // For now: acknowledge install
    return NextResponse.json({
      ok: true,
      pluginId,
      installedAt: Date.now(),
      message: `Plugin ${pluginId} registered. Restart to activate.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
