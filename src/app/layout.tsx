import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="da" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
