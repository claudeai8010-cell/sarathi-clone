import 'server-only';

import { randomUUID } from 'crypto';


import { created, handleApiError, ok } from '@/lib/api/response';
import { CreateBrokerBodySchema } from '@/lib/api/schemas';
import { brokerService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// GET /v1/brokers — list all brokers in the directory
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const brokers = await brokerService.listBrokers();
    return ok(brokers, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// POST /v1/brokers — add a broker to the directory
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = CreateBrokerBodySchema.parse(await req.json());
    const broker = await brokerService.createBroker({
      brokerId: body.brokerId ?? randomUUID(),
      name: body.name,
      phone: body.phone,
      company: body.company,
      averagePaymentDelay: body.averagePaymentDelay,
      rating: body.rating,
      notes: body.notes,
    });
    return created(broker, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
