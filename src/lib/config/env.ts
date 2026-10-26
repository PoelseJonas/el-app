// Reads and validates environment variables in one place, so a missing or wrong value
// fails with a clear message at startup instead of deep inside an API call.
// Server only: ELOVERBLIK_REFRESH_TOKEN must never reach the browser.

import { z } from "zod";

const envSchema = z.object({
  PRICE_AREA: z.enum(["DK1", "DK2"]).default("DK1"),
  // An empty value in .env.local means "no token": the app falls back to demo data.
  ELOVERBLIK_REFRESH_TOKEN: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type Env = z.infer<typeof envSchema>;

/** Validates raw variables. Separate from getEnv() so it can be tested without process.env. */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
