import { describe, expect, it } from "vitest";
import da from "@/i18n/messages/da.json";
import en from "@/i18n/messages/en.json";

/** All keys as dotted paths, e.g. "nav.usage". */
function keysOf(messages: object, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? keysOf(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("messages", () => {
  // da.json is the source of truth; a missing English text would otherwise only show up at runtime.
  it("has the same keys in every language", () => {
    expect(keysOf(en).sort()).toEqual(keysOf(da).sort());
  });
});
