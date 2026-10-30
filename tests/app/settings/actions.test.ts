import { afterEach, describe, expect, it, vi } from "vitest";
import { setLocale, setTheme } from "@/app/settings/actions";

// cookies() only exists inside a Next.js request, so the test records what would be set.
const cookieStore = vi.hoisted(() => ({ set: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

afterEach(() => {
  cookieStore.set.mockClear();
});

function form(name: string, value: string): FormData {
  const data = new FormData();
  data.set(name, value);
  return data;
}

describe("setLocale", () => {
  it("saves a supported language in the NEXT_LOCALE cookie", async () => {
    // Arrange
    const english = form("locale", "en");

    // Act
    await setLocale(english);

    // Assert
    expect(cookieStore.set).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "en",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });

  it("ignores a language the app does not support", async () => {
    // Arrange
    const german = form("locale", "de");

    // Act
    await setLocale(german);

    // Assert
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("setTheme", () => {
  it("saves a known theme in the THEME cookie", async () => {
    // Arrange
    const dark = form("theme", "dark");

    // Act
    await setTheme(dark);

    // Assert
    expect(cookieStore.set).toHaveBeenCalledWith(
      "THEME",
      "dark",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("ignores an unknown theme", async () => {
    // Arrange
    const blue = form("theme", "blue");

    // Act
    await setTheme(blue);

    // Assert
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});
