import 'server-only';


import { fail, handleApiError, ok } from '@/lib/api/response';
import { analyticsService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// ============================================================
// GET /v1/analytics/weekly
// Returns aggregated totals for the 7-day period starting on
// weekStart.
//
// Query params:
//   weekStart — ISO 8601 date string for the first day of the
//               week (e.g. 2026-06-30). Defaults to most recent
//               Sunday relative to today.
//
// userId is sourced from the JWT payload via the x-user-id header
// injected by middleware. No userId query parameter accepted.
// ============================================================

function mostRecentSunday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return fail(401, 'Authentication required', 'UNAUTHORIZED', requestId);
    }

    const rawDate = req.nextUrl.searchParams.get('weekStart');
    const weekStart = rawDate ? new Date(rawDate) : mostRecentSunday();

    if (isNaN(weekStart.getTime())) {
      return fail(
        400,
        'Invalid weekStart format — use ISO 8601 (e.g. 2026-06-30)',
        'INVALID_PARAM',
        requestId,
      );
    }

    const weekly = await analyticsService.getWeeklyTotals(userId, weekStart);
    return ok(weekly, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
