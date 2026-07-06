import 'server-only';


import { fail, handleApiError, ok } from '@/lib/api/response';
import { VerifyBodySchema } from '@/lib/api/schemas';
import { signJwt } from '@/lib/auth/jwt';
import { verifyOtp } from '@/lib/auth/otp';
import { userService } from '@/lib/container';
import { logger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// ============================================================
// POST /v1/auth/verify
// Verifies the OTP for a phone number. On success:
//   - Signs a 24h JWT containing userId + phone
//   - Returns the JWT and the driver's UserSummaryDTO
//
// The user must already exist (registered via POST /v1/users).
// A 404 response means the driver profile does not exist yet.
// ============================================================

const OTP_ERROR_MAP: Record<string, { message: string; code: string }> = {
  not_found: { message: 'No OTP found for this phone. Request a new one.', code: 'OTP_NOT_FOUND' },
  expired: { message: 'OTP has expired. Request a new one.', code: 'OTP_EXPIRED' },
  invalid: { message: 'Incorrect OTP.', code: 'OTP_INVALID' },
  max_attempts: { message: 'Too many incorrect attempts. Request a new OTP.', code: 'OTP_MAX_ATTEMPTS' },
};

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = VerifyBodySchema.parse(await req.json());
    const result = verifyOtp(body.phone, body.otp);

    if (!result.ok) {
      const mapped = OTP_ERROR_MAP[result.reason] ?? {
        message: 'OTP verification failed',
        code: 'OTP_ERROR',
      };
      return fail(401, mapped.message, mapped.code, requestId);
    }

    const user = await userService.getUserByPhone(body.phone);
    if (!user) {
      return fail(
        404,
        'No driver profile found for this phone. Register via POST /v1/users first.',
        'DRIVER_NOT_FOUND',
        requestId,
      );
    }

    const token = await signJwt({ sub: user.userId, phone: user.phone });

    logger.info('POST /v1/auth/verify: login successful', { userId: user.userId });

    return ok({ token, user }, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
