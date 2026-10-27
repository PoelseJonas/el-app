// Supported languages. Kept apart from request.ts so client code and tests can
// import it without pulling in next/headers.

export const locales = ["da", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "da";

/** Cookie that stores the language chosen in settings. Name follows next-intl's convention. */
export const localeCookieName = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}
