import 'server-only';

import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  const missing = Object.entries(fieldErrors)
    .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(', ')}`)
    .join('\n');
  throw new Error(
    `Invalid or missing server environment variables:\n${missing}\n\nCheck your .env.local file against .env.example.`,
  );
}

export const serverEnv = parsed.data;
export type ServerEnv = typeof serverEnv;
