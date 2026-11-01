import { cn } from "cn";

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  /** Server Action that receives the form; the chosen value is sent under `name`. */
  action: (formData: FormData) => Promise<void>;
  name: string;
  /** Heading for the group, also read by screen readers. */
  legend: string;
  /** The currently chosen value, shown as selected. */
  value: string;
  options: readonly SegmentedControlOption[];
}

/**
 * A row of mutually exclusive choices, like iOS' segmented control. Each option is a submit
 * button in a plain <form>, so it works without JavaScript: the click posts the form to the
 * Server Action, which saves the choice, and Next.js re-renders the page.
 */
export function SegmentedControl({
  action,
  name,
  legend,
  value,
  options,
}: SegmentedControlProps) {
  return (
    <form action={action}>
      <fieldset>
        <legend className="mb-2 text-footnote text-muted-foreground uppercase">
          {legend}
        </legend>
        <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-muted p-1">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="submit"
                name={name}
                value={option.value}
                aria-pressed={selected}
                className={cn(
                  // min-h-11 (2.75rem) is the touch target size from docs/design.md (Fitts' law).
                  "min-h-11 rounded-lg px-3 text-subheadline text-muted-foreground transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected &&
                    "bg-background font-medium text-foreground shadow-sm",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}
