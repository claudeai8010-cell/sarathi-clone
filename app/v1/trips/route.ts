import 'server-only';

import { randomUUID } from 'crypto';


import { created, fail, handleApiError, ok } from '@/lib/api/response';
import { CreateTripBodySchema } from '@/lib/api/schemas';
import { tripService } from '@/lib/container';
import { TripStatus } from '@/types/database';

import type { TripSummaryDTO } from '@/dto/TripSummaryDTO';
import type { NextRequest } from 'next/server';

// ============================================================
// GET  /v1/trips — list trips for a driver with filter/pagination
// POST /v1/trips — create a trip from pre-parsed structured data
//
// For AI-assisted parsing before creation: POST /v1/ai/parse
// ============================================================

// ── GET — list + filter + paginate ───────────────────────────

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const { searchParams } = req.nextUrl;

    const userId = searchParams.get('userId') ?? req.headers.get('x-user-id');
    if (!userId) {
      return fail(400, 'userId query parameter is required', 'MISSING_PARAM', requestId);
    }

    const statusParam = searchParams.get('status');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const sortOrder = searchParams.get('sort') === 'asc' ? 'asc' : 'desc';

    let trips: TripSummaryDTO[] = await tripService.listTripsByUser(userId);

    // Filter by status (validate against enum)
    if (statusParam) {
      const validStatuses = Object.values(TripStatus) as string[];
      if (!validStatuses.includes(statusParam)) {
        return fail(
          400,
          `Invalid status. Valid values: ${validStatuses.join(', ')}`,
          'INVALID_PARAM',
          requestId,
        );
      }
      const statusFilter = statusParam as TripStatus;
      trips = trips.filter((t) => t.status === statusFilter);
    }

    // Filter by date range (applied to createdAt)
    if (startDateParam) {
      const start = new Date(startDateParam);
      if (isNaN(start.getTime())) {
        return fail(400, 'Invalid startDate — use ISO 8601', 'INVALID_PARAM', requestId);
      }
      trips = trips.filter((t) => new Date(t.createdAt) >= start);
    }

    if (endDateParam) {
      const end = new Date(endDateParam);
      if (isNaN(end.getTime())) {
        return fail(400, 'Invalid endDate — use ISO 8601', 'INVALID_PARAM', requestId);
      }
      trips = trips.filter((t) => new Date(t.createdAt) <= end);
    }

    // Sort by createdAt
    trips.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });

    // Paginate
    const total = trips.length;
    const totalPages = Math.ceil(total / limit);
    const items = trips.slice((page - 1) * limit, page * limit);

    return ok({ items, total, page, limit, totalPages }, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// ── POST — create ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = CreateTripBodySchema.parse(await req.json());
    const trip = await tripService.createTrip({
      tripId: body.tripId ?? randomUUID(),
      userId: body.userId,
      parsed: body.parsed,
    });
    return created(trip, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
