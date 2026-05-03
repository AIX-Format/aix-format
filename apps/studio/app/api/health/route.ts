import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const envKeys = [
    'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'OLLAMA_BASE_URL',
    'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'NEXT_PUBLIC_APP_URL',
  ];

  const envStatus = envKeys.map(key => ({
    key,
    set: !!process.env[key],
    masked: process.env[key]
      ? process.env[key]!.slice(0, 6) + '…'
      : undefined,
  }));

  const llm = process.env.OPENAI_API_KEY
    ? 'OpenAI'
    : process.env.ANTHROPIC_API_KEY
    ? 'Anthropic'
    : process.env.OLLAMA_BASE_URL
    ? 'Ollama (local)'
    : 'none — set API key';

  const redis = process.env.KV_REST_API_URL ? 'connected' : 'not configured';

  // Health score: 10 pts per required env var set
  const required = ['OPENAI_API_KEY', 'KV_REST_API_URL', 'KV_REST_API_TOKEN'];
  const score = 70 + required.filter(k => !!process.env[k]).length * 10;

  return NextResponse.json({
    ok: true,
    llm,
    redis,
    score,
    envStatus,
    timestamp: Date.now(),
  });
}
