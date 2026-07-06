import 'server-only';

import { randomUUID } from 'crypto';


import { created, handleApiError } from '@/lib/api/response';
import { CreateUserBodySchema } from '@/lib/api/schemas';
import { userService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// POST /v1/users — register a new driver
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = CreateUserBodySchema.parse(await req.json());
    const user = await userService.createUser({
      userId: body.userId ?? randomUUID(),
      phone: body.phone,
      name: body.name,
      vehicleModel: body.vehicleModel,
      vehicleNumber: body.vehicleNumber,
      fuelType: body.fuelType,
      baseMileage: body.baseMileage,
    });
    return created(user, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
