import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@tests/helpers/render-with-intl";
import { TopNav } from "@/components/layout/top-nav";

// usePathname needs Next.js' router, which does not exist in tests, so we fake it.
const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

afterEach(() => {
  pathname.current = "/";
});

describe("TopNav", () => {
  it("has the same sections as the bottom nav, plus the app name", () => {
    renderWithIntl(<TopNav />);
    const nav = screen.getByRole("navigation", { name: "Hovedmenu" });
    // 4 sections + the app name linking home.
    expect(nav.querySelectorAll("a")).toHaveLength(5);
  });

  it("marks the current section", () => {
    pathname.current = "/settings";
    renderWithIntl(<TopNav />, "en");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Usage" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
