import { afterEach, describe, expect, it, vi } from "vitest";
import { setLocale } from "@/app/settings/actions";

// cookies() only exists inside a Next.js request, so the test records what would be set.
const cookieStore = vi.hoisted(() => ({ set: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

afterEach(() => {
  cookieStore.set.mockClear();
});

function form(locale: string): FormData {
  const data = new FormData();
  data.set("locale", locale);
  return data;
}

describe("setLocale", () => {
  it("saves a supported language in the NEXT_LOCALE cookie", async () => {
    await setLocale(form("en"));
    expect(cookieStore.set).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "en",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });

  it("ignores a language the app does not support", async () => {
    await setLocale(form("de"));
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});
