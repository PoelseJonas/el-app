import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/config/env";

describe("parseEnv", () => {
  it("defaults to DK1 and no token", () => {
    expect(parseEnv({})).toEqual({
      PRICE_AREA: "DK1",
      ELOVERBLIK_REFRESH_TOKEN: undefined,
    });
  });

  it("treats an empty token as missing", () => {
    expect(
      parseEnv({ ELOVERBLIK_REFRESH_TOKEN: "" }).ELOVERBLIK_REFRESH_TOKEN,
    ).toBeUndefined();
  });

  it("rejects an unknown price area", () => {
    expect(() => parseEnv({ PRICE_AREA: "DK3" })).toThrow(/PRICE_AREA/);
  });
});
