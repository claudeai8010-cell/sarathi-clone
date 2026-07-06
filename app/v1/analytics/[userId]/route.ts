import 'server-only';


import { handleApiError, ok } from '@/lib/api/response';
import { analyticsService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { userId: string } };

// GET /v1/analytics/:userId
// Returns DriverAnalyticsDTO — daily, weekly, and monthly aggregations
// for the driver. All periods are relative to server time (UTC).
export async function GET(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const analytics = await analyticsService.getDriverAnalytics(params.userId);
    return ok(analytics, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
