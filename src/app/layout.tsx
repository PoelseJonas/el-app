import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { cn } from "cn";
import { AppShell } from "@/components/layout/app-shell";
import { getSavedTheme } from "@/components/layout/get-saved-theme";
import { themeClassName } from "@/components/layout/theme";
import "./globals.css";

// Inter comes with the shadcn "luma" style. It is exposed as --font-sans, which
// globals.css maps to Tailwind's font-sans.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "El-app",
  description: "Dit elforbrug, elpris og CO2-udledning time for time",
};

// "cover" lets the page extend under the iPhone home indicator, so
// env(safe-area-inset-bottom) in the bottom nav gets a real value.
export const viewport: Viewport = {
  viewportFit: "cover",
};

// The language comes from a cookie or the Accept-Language header (src/i18n/request.ts), so
// every page depends on the request and cannot be prerendered. With cacheComponents on,
// Next.js requires opting into that explicitly ("blocking route"). The alternative is the
// language in the URL (/da/..., /en/...), see docs/architecture.md.
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The language picked in src/i18n/request.ts, so screen readers and the browser know it.
  const locale = await getLocale();
  // Read on the server so the first paint has the right theme. Costs nothing extra: the page
  // is already dynamic because of the language cookie (see `instant` above).
  const theme = await getSavedTheme();
  const htmlClassName = cn(
    inter.variable,
    "h-full antialiased",
    themeClassName(theme),
  );

  return (
    <html lang={locale} className={htmlClassName}>
      <body className="flex min-h-full flex-col">
        {/* Makes the messages available to client components (useTranslations). */}
        <NextIntlClientProvider>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
