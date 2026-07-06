import 'server-only';


import { handleApiError, noContent } from '@/lib/api/response';
import { tripService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { tripId: string } };

// POST /v1/trips/:tripId/sync — mark a trip as synced to the server
// Called by the mobile client after offline-created trips are confirmed.
export async function POST(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    await tripService.markSynced(params.tripId);
    return noContent();
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
