import { describe, expect, it } from "vitest";
import { lowestHours } from "@/lib/calc/best-hours";

function hour(utcHour: number, value: number) {
  return { start: new Date(Date.UTC(2026, 9, 28, utcHour)), value };
}

describe("lowestHours", () => {
  const hours = [hour(0, 5), hour(1, 1), hour(2, 4), hour(3, 2), hour(4, 3)];

  it("picks the lowest values and returns them in time order", () => {
    const best = lowestHours(hours, (h) => h.value, 3);
    expect(best.map((h) => h.start.getUTCHours())).toEqual([1, 3, 4]);
  });

  it("prefers the earlier hour on a tie", () => {
    const best = lowestHours([hour(5, 1), hour(2, 1)], (h) => h.value, 1);
    expect(best[0].start.getUTCHours()).toBe(2);
  });

  it("returns all hours when there are fewer than asked for", () => {
    expect(lowestHours(hours.slice(0, 2), (h) => h.value, 3)).toHaveLength(2);
  });

  it("does not change the input", () => {
    const copy = [...hours];
    lowestHours(hours, (h) => h.value, 3);
    expect(hours).toEqual(copy);
  });
});
