import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { TopNav } from "./top-nav";

/** Frame around every page: the page content plus the app navigation (top on desktop, bottom on mobile). */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      {/* Extra bottom padding on mobile keeps content clear of the fixed bottom nav. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-28 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
