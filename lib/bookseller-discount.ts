/** An explicit empty actual discount overrides the imported committed discount. */
export function defaultBooksellerDiscount(actual: string | null | undefined, committed: string | null | undefined): string {
  return actual !== null && actual !== undefined ? actual.trim() : committed?.trim() ?? "";
}
