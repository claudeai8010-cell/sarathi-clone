import 'server-only';


import { fail, handleApiError, ok } from '@/lib/api/response';
import { analyticsService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// ============================================================
// GET /v1/analytics/daily
// Returns totals for a single day.
//
// Query params:
//   date  — ISO 8601 date string (e.g. 2026-06-30). Defaults to today.
//
// userId is sourced from the JWT payload via the x-user-id header
// injected by middleware. No userId query parameter accepted.
// ============================================================

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return fail(401, 'Authentication required', 'UNAUTHORIZED', requestId);
    }

    const rawDate = req.nextUrl.searchParams.get('date');
    const date = rawDate ? new Date(rawDate) : new Date();

    if (isNaN(date.getTime())) {
      return fail(400, 'Invalid date format — use ISO 8601 (e.g. 2026-06-30)', 'INVALID_PARAM', requestId);
    }

    const daily = await analyticsService.getDailyTotals(userId, date);
    return ok(daily, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
