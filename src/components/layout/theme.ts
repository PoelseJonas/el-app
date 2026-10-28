// Light/dark theme choices. "system" follows the OS (prefers-color-scheme); the other two
// override it. The choice is saved in a cookie and read by the root layout, the same way as
// the language (src/i18n/config.ts), so the first paint already has the right colours.

export const themes = ["system", "light", "dark"] as const;
export type Theme = (typeof themes)[number];
export const defaultTheme: Theme = "system";

export const themeCookieName = "THEME";

export function isTheme(value: string | undefined): value is Theme {
  return themes.includes(value as Theme);
}

/**
 * Class for <html>. "system" gets none, so the CSS media query decides; "light" is needed to
 * override a dark OS (see the dark variant in src/app/globals.css).
 */
export function themeClassName(theme: Theme): string | undefined {
  return theme === "system" ? undefined : theme;
}
