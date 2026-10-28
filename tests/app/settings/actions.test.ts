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
    await setLocale(form("locale", "en"));
    expect(cookieStore.set).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "en",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });

  it("ignores a language the app does not support", async () => {
    await setLocale(form("locale", "de"));
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("setTheme", () => {
  it("saves a known theme in the THEME cookie", async () => {
    await setTheme(form("theme", "dark"));
    expect(cookieStore.set).toHaveBeenCalledWith(
      "THEME",
      "dark",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("ignores an unknown theme", async () => {
    await setTheme(form("theme", "blue"));
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});
