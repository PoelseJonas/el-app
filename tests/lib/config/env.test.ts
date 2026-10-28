import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/config/env";

describe("parseEnv", () => {
  it("defaults to DK1, the real Energi Data Service and no token", () => {
    expect(parseEnv({})).toEqual({
      PRICE_AREA: "DK1",
      ENERGIDATA_BASE_URL: "https://api.energidataservice.dk",
      ELOVERBLIK_REFRESH_TOKEN: undefined,
    });
  });

  it("rejects an Energi Data Service address that is not a URL", () => {
    expect(() => parseEnv({ ENERGIDATA_BASE_URL: "localhost" })).toThrow(
      /ENERGIDATA_BASE_URL/,
    );
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
