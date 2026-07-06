import { NextResponse } from 'next/server';

import { verifyJwt } from '@/lib/auth/jwt';

import type { NextRequest } from 'next/server';


// ============================================================
// Global Middleware — Phase 4A
// Runs on every request matching the config.matcher pattern.
//
// Responsibilities (in order):
//   1. Attach a unique x-request-id to every request
//   2. Apply per-IP rate limiting
//   3. Verify JWT for protected routes
//   4. Forward x-user-id + x-request-id to route handlers
//
// NOTE: Rate limiter uses module-level Map (in-memory).
// This works correctly on Replit (single long-lived Node.js
// process). Replace with Redis for multi-instance deployments.
// ============================================================

// ── Rate limiter ─────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_REQUESTS = 120;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) return true;
  entry.count++;
  return false;
}

// ── Public routes — no JWT required ──────────────────────────

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  '/v1/auth/login',
  '/v1/auth/verify',
]);

// ── Response helpers (inline — avoids importing server-only) ─

function unauthorized(requestId: string, message = 'Authentication required'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code: 'UNAUTHORIZED', message },
      requestId,
      timestamp: new Date().toISOString(),
    }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  );
}

function tooManyRequests(requestId: string): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests — slow down' },
      requestId,
      timestamp: new Date().toISOString(),
    }),
    { status: 429, headers: { 'Content-Type': 'application/json' } },
  );
}

// ── Middleware ────────────────────────────────────────────────

export async function middleware(req: NextRequest): Promise<NextResponse | Response> {
  const requestId = crypto.randomUUID();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { pathname } = req.nextUrl;

  // 1. Rate limiting
  if (isRateLimited(`${ip}:${pathname}`)) {
    return tooManyRequests(requestId);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  // 2. Public routes — skip JWT verification
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 3. Protected routes — require valid JWT
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return unauthorized(requestId);
  }

  try {
    const payload = await verifyJwt(token);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-phone', payload.phone);
  } catch {
    return unauthorized(requestId, 'Invalid or expired token');
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/v1/:path*'],
};
