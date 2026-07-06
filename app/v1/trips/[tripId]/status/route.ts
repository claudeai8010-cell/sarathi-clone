import 'server-only';


import { handleApiError, ok } from '@/lib/api/response';
import { TransitionStatusBodySchema } from '@/lib/api/schemas';
import { tripService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { tripId: string } };

// PATCH /v1/trips/:tripId/status — advance trip through lifecycle
// Allowed transitions: New → Accepted → Loaded → In Transit → Delivered → Paid
// Any out-of-order transition returns 409 INVALID_TRIP_TRANSITION.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = TransitionStatusBodySchema.parse(await req.json());
    const trip = await tripService.transitionStatus(params.tripId, body.status);
    return ok(trip, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
