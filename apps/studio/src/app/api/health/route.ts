import { NextResponse } from 'next/server';

export async function GET() {
  const salt = process.env.AIX_UID_HASH_SALT;
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      hasSalt: !!salt,
      environment: process.env.NODE_ENV
    }
  });
}
