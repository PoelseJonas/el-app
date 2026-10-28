// Reads and validates environment variables in one place, so a missing or wrong value
// fails with a clear message at startup instead of deep inside an API call.
// Server only: ELOVERBLIK_REFRESH_TOKEN must never reach the browser.

// Makes the build fail if this file is ever imported from a Client Component.
// Next.js would not send the token anyway (no NEXT_PUBLIC_ prefix), but this turns a
// confusing runtime error into a clear build error.
import "server-only";
import { z } from "zod";

const envSchema = z.object({
  PRICE_AREA: z.enum(["DK1", "DK2"]).default("DK1"),
  // Only changed by the Playwright tests, which point it at a local server with saved
  // responses (tests/e2e/fixture-server.mts), so they never call the real API.
  ENERGIDATA_BASE_URL: z.url().default("https://api.energidataservice.dk"),
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
