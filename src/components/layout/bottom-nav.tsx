"use client";
import { cn } from "cn";
import {
  ChartColumn,
  House,
  Lightbulb,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  /** Key under "nav" in src/i18n/messages/*.json. */
  labelKey: "today" | "usage" | "insights" | "settings";
  icon: LucideIcon;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", labelKey: "today", icon: House },
  { href: "/usage", labelKey: "usage", icon: ChartColumn },
  { href: "/insights", labelKey: "insights", icon: Lightbulb },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

// "/" must match exactly, otherwise it would be active on every page.
function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

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
