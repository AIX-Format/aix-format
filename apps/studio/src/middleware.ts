/**
 * Sovereign API Harness Middleware
 * 
 * ONE GATE protects the entire ecosystem using the consolidated HarnessGate.
 * Consolidates: Identity (Auth), Economy (Payment), and Stability (Rate Limit).
 * 
 * @module middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHarness, HarnessConfig } from '@aix-core';
import { verifyToken } from '@/lib/auth';

/**
 * Route Classification
 */
const PUBLIC_ROUTES = ['/api/health', '/api/spec', '/api/marketplace', '/api/pulse', '/.well-known'];
const SENSITIVE_ROUTES = ['/api/kyc', '/api/stripe', '/api/pi/payment', '/api/dna/sign', '/api/economics'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api') || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 1. Unified Harness Clearance
  const harness = getHarness();
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return fail(401, 'NO_TOKEN', 'Authentication required');
  }

  // Verify Identity (Studio-specific layer)
  const user = await verifyToken(token);
  if (!user) {
    return fail(401, 'INVALID_TOKEN', 'Identity verification failed');
  }

  // Check Sovereign Clearance (Integrity, Rate-Limit, Payment)
  const agentId = req.headers.get('x-agent-id') || 'global';
  const clearance = await harness.checkClearance(agentId, user.id, pathname.includes('/invoke') ? 'invoke' : 'general');

  if (!clearance.allowed) {
    const status = clearance.reason === 'RATE_LIMIT_EXCEEDED' ? 429 : 402; // 402 for Payment required
    return fail(status, clearance.reason || 'FORBIDDEN', `Sovereign Gate: ${clearance.reason}`);
  }

  // 2. Success → Inject headers and proceed
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', user.role || 'user');
  
  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(r => path.startsWith(r));
}

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

export const config = {
  matcher: ['/api/:path*'],
};

// Made with Moe Abdelaziz — Consolidated for Sovereign Protocol
