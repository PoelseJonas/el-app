"use client";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

/**
 * Menu at the top on desktop (from `md`), where users expect it (Jakob's law). Same items as
 * BottomNav, which is hidden at these widths.
 */
export function TopNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 hidden border-b bg-background/80 backdrop-blur-lg md:block">
      <nav
        aria-label={t("label")}
        className="mx-auto flex w-full max-w-3xl items-center gap-6 px-4"
      >
        <Link href="/" className="text-headline">
          {t("appName")}
        </Link>
        <ul className="flex flex-1 justify-end gap-1">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-lg px-3 text-subheadline text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "font-medium text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  <span>{t(labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
