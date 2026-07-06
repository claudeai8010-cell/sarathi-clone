import 'server-only';


import { handleApiError, ok } from '@/lib/api/response';
import { ParseTripBodySchema } from '@/lib/api/schemas';
import { tripService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// POST /v1/trips/parse
// Extracts structured trip data from raw driver text via the AI provider.
// Does NOT persist a trip — use POST /v1/trips to create after confirming.
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = ParseTripBodySchema.parse(await req.json());
    const extraction = await tripService.parseTripFromText(body.text);
    return ok(extraction, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
