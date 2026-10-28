// Typed errors that sources throw. Services pass them on, and the UI picks the text for each
// (src/lib never returns user-facing text). See "Fejlhåndtering" in docs/architecture.md.

/** Why a source could not deliver data. */
export type SourceUnavailableReason = "network" | "http" | "invalid-response";

/** An external source could not be reached, answered with an error, or sent data we do not understand. */
export class SourceUnavailableError extends Error {
  override readonly name = "SourceUnavailableError";

  constructor(
    /** Which source or dataset failed, e.g. "energidata/DayAheadPrices". Never a URL with secrets. */
    readonly source: string,
    readonly reason: SourceUnavailableReason,
    /** HTTP status when reason is "http". */
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(
      `${source} unavailable: ${reason}${status ? ` (${status})` : ""}`,
      options,
    );
  }
}
