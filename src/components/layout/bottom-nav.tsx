"use client";
import { cn } from "cn";
import {
  ChartColumn,
  House,
  Lightbulb,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// TODO: move labels to the dictionary (nav.*) when next-intl is set up.
const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "I dag", icon: House },
  { href: "/usage", label: "Forbrug", icon: ChartColumn },
  { href: "/insights", label: "Indsigt", icon: Lightbulb },
  { href: "/settings", label: "Indstillinger", icon: Settings },
];

// "/" must match exactly, otherwise it would be active on every page.
function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hovedmenu"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
