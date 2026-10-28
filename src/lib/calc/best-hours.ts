/**
 * The `count` items with the lowest value (e.g. the cheapest or greenest hours), returned in
 * time order so they read naturally ("kl. 02, 03 and 14"). On a tie the earlier hour wins.
 */
export function lowestHours<T extends { start: Date }>(
  items: T[],
  valueOf: (item: T) => number,
  count: number,
): T[] {
  return [...items]
    .sort(
      (a, b) =>
        valueOf(a) - valueOf(b) || a.start.getTime() - b.start.getTime(),
    )
    .slice(0, count)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}
