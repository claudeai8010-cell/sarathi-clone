import 'server-only';


import { handleApiError, noContent, ok } from '@/lib/api/response';
import { UpdateBrokerBodySchema } from '@/lib/api/schemas';
import { brokerService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { brokerId: string } };

// GET /v1/brokers/:brokerId — fetch a broker by business ID
export async function GET(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const broker = await brokerService.getBrokerById(params.brokerId);
    return ok(broker, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// PATCH /v1/brokers/:brokerId — update broker profile
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = UpdateBrokerBodySchema.parse(await req.json());
    const broker = await brokerService.updateBroker(params.brokerId, body);
    return ok(broker, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// DELETE /v1/brokers/:brokerId — soft-delete a broker
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    await brokerService.deleteBroker(params.brokerId);
    return noContent();
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
