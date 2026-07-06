import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('App'),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  const details = Object.entries(fieldErrors)
    .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(', ')}`)
    .join('\n');
  throw new Error(`Invalid client environment variables:\n${details}`);
}

export const clientEnv = parsed.data;
export type ClientEnv = typeof clientEnv;
