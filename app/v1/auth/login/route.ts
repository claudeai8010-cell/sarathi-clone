import 'server-only';


import { handleApiError, ok } from '@/lib/api/response';
import { LoginBodySchema } from '@/lib/api/schemas';
import { createOtp } from '@/lib/auth/otp';
import { logger } from '@/lib/logger';

import type { NextRequest } from 'next/server';

// ============================================================
// POST /v1/auth/login
// Accepts a phone number, generates a 6-digit OTP, and (in
// Phase 4A) logs it instead of sending an SMS. The OTP is
// returned in the response for development convenience.
//
// Production: integrate an SMS provider here. Remove the OTP
// from the response body. Store it only in the OTP store.
// ============================================================

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = LoginBodySchema.parse(await req.json());
    const otp = createOtp(body.phone);

    // In production: dispatch OTP via SMS here, then remove
    // 'otp' from the response. Logged for dev convenience.
    logger.info('POST /v1/auth/login: OTP generated', {
      phone: body.phone.slice(0, -4) + '****',
    });

    return ok(
      {
        message: 'OTP sent',
        // DEV ONLY — remove before production
        otp,
        expiresInSeconds: 300,
      },
      requestId,
    );
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
