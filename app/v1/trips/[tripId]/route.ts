import 'server-only';


import { handleApiError, ok } from '@/lib/api/response';
import { tripService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { tripId: string } };

// GET /v1/trips/:tripId — fetch a single trip by business ID
export async function GET(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const trip = await tripService.getTripById(params.tripId);
    return ok(trip, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
