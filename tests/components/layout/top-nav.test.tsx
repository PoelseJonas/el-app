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
  it("has the four sections plus the app name", () => {
    // Arrange
    pathname.current = "/";

    // Act
    renderWithIntl(<TopNav />);

    // Assert
    const nav = screen.getByRole("navigation", { name: "Hovedmenu" });
    expect(nav.querySelectorAll("a")).toHaveLength(5);
  });

  it("marks the current section", () => {
    // Arrange
    pathname.current = "/settings";

    // Act
    renderWithIntl(<TopNav />, "en");

    // Assert
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark the other sections", () => {
    // Arrange
    pathname.current = "/settings";

    // Act
    renderWithIntl(<TopNav />, "en");

    // Assert
    expect(screen.getByRole("link", { name: "Usage" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
