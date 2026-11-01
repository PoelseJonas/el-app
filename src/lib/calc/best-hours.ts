import { compareByStart } from "@/lib/utils/time";

/**
 * The `count` items with the lowest value (e.g. the cheapest or greenest hours), returned in
 * time order so they read naturally ("kl. 02, 03 and 14"). On a tie the earlier hour wins.
 */
export function lowestHours<T extends { start: Date }>(
  items: T[],
  valueOf: (item: T) => number,
  count: number,
): T[] {
  const lowestValueFirst = [...items].sort(
    (a, b) => valueOf(a) - valueOf(b) || compareByStart(a, b),
  );
  const lowest = lowestValueFirst.slice(0, count);

  return lowest.sort(compareByStart);
}
