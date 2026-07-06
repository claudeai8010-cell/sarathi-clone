import 'server-only';

import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { mapErrorToMappedError } from '@/utils/apiErrorMapper';

import type { ApiResponse } from '@/types/api';

// ============================================================
// API Response Helpers
// All responses follow the ApiResponse<T> envelope:
//   { success, data?, error?, requestId, timestamp }
//
// Every helper accepts an optional requestId — route handlers
// should pass req.headers.get('x-request-id') set by middleware.
// When omitted a UUID is auto-generated (backwards-compatible
// with Phase 4 route handlers that pre-date middleware).
// ============================================================

function ts(): string {
  return new Date().toISOString();
}

export function ok<T>(data: T, requestId?: string): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    requestId: requestId ?? randomUUID(),
    timestamp: ts(),
  };
  return NextResponse.json(body, { status: 200 });
}

export function created<T>(data: T, requestId?: string): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    requestId: requestId ?? randomUUID(),
    timestamp: ts(),
  };
  return NextResponse.json(body, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  status: number,
  message: string,
  code: string,
  requestId?: string,
): NextResponse {
  const body: ApiResponse<never> = {
    success: false,
    error: { code, message },
    requestId: requestId ?? randomUUID(),
    timestamp: ts(),
  };
  return NextResponse.json(body, { status });
}

// ============================================================
// Canonical error handler
// Delegates mapping logic to apiErrorMapper — route handlers
// MUST NOT handle errors inline. Always call handleApiError.
// ============================================================

export function handleApiError(err: unknown, requestId?: string): NextResponse {
  const rid = requestId ?? randomUUID();

  // ZodError is a request validation concern — handled here
  // before delegating to the domain/db mapper.
  if (err instanceof ZodError) {
    const body: ApiResponse<never> = {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: err.flatten(),
      },
      requestId: rid,
      timestamp: ts(),
    };
    return NextResponse.json(body, { status: 400 });
  }

  const mapped = mapErrorToMappedError(err);

  // LowAIConfidenceException returns 202: the request was
  // accepted but the client must clarify before proceeding.
  if (mapped.requiresClarification) {
    const body: ApiResponse<{ requiresClarification: true }> = {
      success: true,
      data: { requiresClarification: true },
      error: mapped.apiError,
      requestId: rid,
      timestamp: ts(),
    };
    return NextResponse.json(body, { status: mapped.status });
  }

  const body: ApiResponse<never> = {
    success: false,
    error: mapped.apiError,
    requestId: rid,
    timestamp: ts(),
  };
  return NextResponse.json(body, { status: mapped.status });
}
