"use client";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Tab bar at the bottom on mobile, like iOS. Hidden from `md`, where TopNav takes over. */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors",
                  active && "font-medium text-primary",
                )}
              >
                <Icon aria-hidden className="size-6" />
                <span>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
