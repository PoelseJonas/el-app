"use server";
// Server Actions for the settings page. Each saves one choice in a cookie; setting a cookie
// in a Server Action makes Next.js re-render the page, so the new choice shows at once.

import { cookies } from "next/headers";
import { z } from "zod";
import { localeCookieName, locales } from "@/i18n/config";

// One year. The choice is a preference, not personal data, so a long lifetime is fine.
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// Form data comes from the browser and can be anything, so it is validated like any other input.
const localeSchema = z.enum(locales);

export async function setLocale(formData: FormData): Promise<void> {
  const result = localeSchema.safeParse(formData.get("locale"));
  if (!result.success) return;

  (await cookies()).set(localeCookieName, result.data, {
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
    // Only read on the server (src/i18n/request.ts), so scripts in the page need no access.
    httpOnly: true,
  });
}
