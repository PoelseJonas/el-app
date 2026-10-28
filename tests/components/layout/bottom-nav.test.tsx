import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@tests/helpers/render-with-intl";
import { BottomNav } from "@/components/layout/bottom-nav";

// usePathname needs Next.js' router, which does not exist in tests, so we fake it.
const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

afterEach(() => {
  pathname.current = "/";
});

function activeLinks() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page");
}

describe("BottomNav", () => {
  it("renders one link per section", () => {
    renderWithIntl(<BottomNav />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("marks only the home link as current on /", () => {
    renderWithIntl(<BottomNav />);
    expect(activeLinks()).toHaveLength(1);
    expect(activeLinks()[0]).toHaveAttribute("href", "/");
  });

  it("marks the section as current on a nested route", () => {
    pathname.current = "/usage/week";
    renderWithIntl(<BottomNav />);
    expect(activeLinks()).toHaveLength(1);
    expect(activeLinks()[0]).toHaveAttribute("href", "/usage");
  });

  it("shows labels in the chosen language", () => {
    renderWithIntl(<BottomNav />, "en");
    expect(
      screen.getByRole("navigation", { name: "Main menu" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Usage" })).toHaveAttribute(
      "href",
      "/usage",
    );
  });
});
