"use server";
// Server Actions for the settings page. Each saves one choice in a cookie; setting a cookie
// in a Server Action makes Next.js re-render the page, so the new choice shows at once.

import { cookies } from "next/headers";
import { z } from "zod";
import { themeCookieName, themes } from "@/components/layout/theme";
import { localeCookieName, locales } from "@/i18n/config";

// One year. The choices are preferences, not personal data, so a long lifetime is fine.
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// Form data comes from the browser and can be anything, so it is validated like any other input.
const localeSchema = z.enum(locales);
const themeSchema = z.enum(themes);

async function saveChoice(name: string, value: string): Promise<void> {
  (await cookies()).set(name, value, {
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
    // Only read on the server (root layout and src/i18n/request.ts), so page scripts need no access.
    httpOnly: true,
  });
}

export async function setLocale(formData: FormData): Promise<void> {
  const result = localeSchema.safeParse(formData.get("locale"));
  if (result.success) await saveChoice(localeCookieName, result.data);
}

export async function setTheme(formData: FormData): Promise<void> {
  const result = themeSchema.safeParse(formData.get("theme"));
  if (result.success) await saveChoice(themeCookieName, result.data);
}
