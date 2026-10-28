interface BestHoursListProps {
  title: string;
  /** Shown when no hours are left, e.g. late in the evening. */
  emptyText: string;
  items: { key: string; label: string; valueLabel: string }[];
}

/** A short grouped list (like iOS Settings) of the best hours: few choices, easy to act on. */
export function BestHoursList({ title, emptyText, items }: BestHoursListProps) {
  return (
    <section>
      <h2 className="mb-2 text-headline">{title}</h2>
      {items.length === 0 ? (
        <p className="text-subheadline text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl bg-card">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-4 px-4 py-3 text-body"
            >
              <span>{item.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {item.valueLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
