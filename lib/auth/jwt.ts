import { jwtVerify, SignJWT } from 'jose';

// ============================================================
// JWT Utilities
// Uses jose — edge-runtime-compatible, no Node.js built-ins.
// Session secret is read directly from process.env (not from
// env.server.ts) so this file is safe to import in middleware.
// ============================================================

export interface JwtPayload {
  sub: string;   // business userId
  phone: string;
  iat?: number;
  exp?: number;
}

const ALGORITHM = 'HS256';
const EXPIRY = '24h';

function getSecret(): Uint8Array {
  const raw = process.env['SESSION_SECRET'];
  if (!raw) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(raw);
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ phone: payload.phone })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALGORITHM] });
  return {
    sub: payload.sub as string,
    phone: payload['phone'] as string,
    iat: payload.iat,
    exp: payload.exp,
  };
}
