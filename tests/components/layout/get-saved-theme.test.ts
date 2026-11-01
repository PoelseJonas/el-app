import { afterEach, describe, expect, it, vi } from "vitest";
import { getSavedTheme } from "@/components/layout/get-saved-theme";

// cookies() only exists inside a Next.js request, so the test decides what the cookie holds.
const savedCookie = vi.hoisted(() => ({
  value: undefined as string | undefined,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () =>
      savedCookie.value === undefined
        ? undefined
        : { value: savedCookie.value },
  }),
}));

afterEach(() => {
  savedCookie.value = undefined;
});

describe("getSavedTheme", () => {
  it("returns the saved theme", async () => {
    // Arrange
    savedCookie.value = "dark";

    // Act
    const theme = await getSavedTheme();

    // Assert
    expect(theme).toBe("dark");
  });

  it("falls back to 'system' when nothing is saved", async () => {
    // Arrange
    savedCookie.value = undefined;

    // Act
    const theme = await getSavedTheme();

    // Assert
    expect(theme).toBe("system");
  });

  it("falls back to 'system' when the cookie holds an unknown value", async () => {
    // Arrange
    savedCookie.value = "blue";

    // Act
    const theme = await getSavedTheme();

    // Assert
    expect(theme).toBe("system");
  });
});
