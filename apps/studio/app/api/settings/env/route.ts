import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { keys } = await req.json() as { keys: Record<string, string> };
    const envPath = join(process.cwd(), '.env.local');

    // Read existing
    let existing: Record<string, string> = {};
    if (existsSync(envPath)) {
      const lines = readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const [k, ...v] = line.split('=');
        if (k?.trim()) existing[k.trim()] = v.join('=').trim();
      }
    }

    // Merge
    const merged = { ...existing, ...Object.fromEntries(
      Object.entries(keys).filter(([, v]) => v.trim() !== '')
    )};

    // Write .env.local
    const content = Object.entries(merged)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    writeFileSync(envPath, content + '\n', 'utf8');

    return NextResponse.json({ ok: true, keysWritten: Object.keys(keys).filter(k => keys[k]).length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
