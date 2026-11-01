"use client";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive, type NavItem } from "./nav-items";

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
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <BottomNavLink item={item} active={isActive(pathname, item.href)} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** One tab: icon above a short label. The active tab uses the accent colour. */
function BottomNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const t = useTranslations("nav");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 text-caption text-muted-foreground transition-colors",
        active && "font-medium text-primary",
      )}
    >
      <Icon aria-hidden className="size-6" />
      <span>{t(item.labelKey)}</span>
    </Link>
  );
}
