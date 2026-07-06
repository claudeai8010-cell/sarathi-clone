import 'server-only';

// ============================================================
// OTP Store — In-Memory
// Phase 4A: in-memory store sufficient for Replit (long-lived
// Node.js process). Replace with Redis in production.
//
// Security properties:
// - 6-digit numeric code
// - 5-minute expiry
// - Max 3 verification attempts before invalidation
// - 1 active OTP per phone at a time
// ============================================================

const OTP_TTL_MS = 5 * 60 * 1000;  // 5 minutes
const MAX_ATTEMPTS = 3;

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpEntry>();

function generateOtp(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

/** Create or replace the OTP for a phone number. Returns the OTP. */
export function createOtp(phone: string): string {
  const otp = generateOtp();
  store.set(phone, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return otp;
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'invalid' | 'max_attempts' };

/** Verify an OTP. Consumes the entry on success. */
export function verifyOtp(phone: string, otp: string): OtpVerifyResult {
  const entry = store.get(phone);
  if (!entry) return { ok: false, reason: 'not_found' };
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: 'expired' };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(phone);
    return { ok: false, reason: 'max_attempts' };
  }
  entry.attempts++;
  if (entry.otp !== otp) return { ok: false, reason: 'invalid' };
  store.delete(phone);
  return { ok: true };
}
