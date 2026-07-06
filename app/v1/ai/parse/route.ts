import 'server-only';


import { handleApiError, ok } from '@/lib/api/response';
import { AiParseBodySchema } from '@/lib/api/schemas';
import { tripService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// ============================================================
// POST /v1/ai/parse
// Extracts structured trip data from raw driver text.
// Does NOT persist a trip — use POST /v1/trips to save.
//
// Protected: requires valid JWT (x-user-id header from middleware).
// userId is read from JWT — not accepted in the request body.
// ============================================================

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = AiParseBodySchema.parse(await req.json());
    const extraction = await tripService.parseTripFromText(body.rawText);
    return ok(extraction, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
