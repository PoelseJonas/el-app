import { describe, expect, it } from "vitest";
import { isTheme, themeClassName } from "@/components/layout/theme";

describe("theme", () => {
  it("accepts only known themes", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });

  it("leaves 'system' to the CSS media query and sets a class otherwise", () => {
    expect(themeClassName("system")).toBeUndefined();
    expect(themeClassName("light")).toBe("light");
    expect(themeClassName("dark")).toBe("dark");
  });
});
