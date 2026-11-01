import { describe, expect, it } from "vitest";
import { isTheme, themeClassName } from "@/components/layout/theme";

describe("isTheme", () => {
  it("accepts a known theme", () => {
    // Arrange
    const value = "dark";

    // Act
    const result = isTheme(value);

    // Assert
    expect(result).toBe(true);
  });

  it("rejects an unknown or missing value", () => {
    // Arrange
    const values = ["blue", undefined];

    // Act
    const results = values.map(isTheme);

    // Assert
    expect(results).toEqual([false, false]);
  });
});

describe("themeClassName", () => {
  it("sets no class for 'system', so the CSS media query decides", () => {
    // Arrange
    const theme = "system";

    // Act
    const className = themeClassName(theme);

    // Assert
    expect(className).toBeUndefined();
  });

  it("uses the theme name as class for light and dark", () => {
    // Arrange
    const themes = ["light", "dark"] as const;

    // Act
    const classNames = themes.map(themeClassName);

    // Assert
    expect(classNames).toEqual(["light", "dark"]);
  });
});
