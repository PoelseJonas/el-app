// The app's sections, shared by BottomNav (mobile) and TopNav (desktop), so both menus always
// show the same items. A new section is one line here plus its label in the dictionary.

import {
  ChartColumn,
  House,
  Lightbulb,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Key under "nav" in src/i18n/messages/*.json. */
  labelKey: "today" | "usage" | "insights" | "settings";
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", labelKey: "today", icon: House },
  { href: "/usage", labelKey: "usage", icon: ChartColumn },
  { href: "/insights", labelKey: "insights", icon: Lightbulb },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

// "/" must match exactly, otherwise it would be active on every page.
export function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
