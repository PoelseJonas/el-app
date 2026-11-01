import { cookies } from "next/headers";
import { defaultTheme, isTheme, themeCookieName, type Theme } from "./theme";

/**
 * The theme saved in Settings, or the default ("system"). Server only: reads the cookie.
 * Kept apart from theme.ts so that file has no Next.js imports and stays easy to test.
 */
export async function getSavedTheme(): Promise<Theme> {
  const saved = (await cookies()).get(themeCookieName)?.value;
  return isTheme(saved) ? saved : defaultTheme;
}
