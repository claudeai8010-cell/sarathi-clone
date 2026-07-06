import 'server-only';


import { handleApiError, noContent, ok } from '@/lib/api/response';
import { UpdateUserBodySchema } from '@/lib/api/schemas';
import { userService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { userId: string } };

// GET /v1/users/:userId — fetch driver profile
export async function GET(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const user = await userService.getUserByUserId(params.userId);
    return ok(user, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// PATCH /v1/users/:userId — update driver profile fields
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = UpdateUserBodySchema.parse(await req.json());
    const user = await userService.updateUser(params.userId, body);
    return ok(user, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// DELETE /v1/users/:userId — soft-delete driver
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    await userService.deleteUser(params.userId);
    return noContent();
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
