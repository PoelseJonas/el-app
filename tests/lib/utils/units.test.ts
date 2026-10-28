import { describe, expect, it } from "vitest";
import { dkkPerMwhToDkkPerKwh } from "@/lib/utils/units";

describe("dkkPerMwhToDkkPerKwh", () => {
  it("converts DKK/MWh to DKK/kWh", () => {
    expect(dkkPerMwhToDkkPerKwh(1250)).toBe(1.25);
  });

  it("keeps negative prices negative", () => {
    expect(dkkPerMwhToDkkPerKwh(-80)).toBe(-0.08);
  });
});
