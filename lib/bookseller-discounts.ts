export type DiscountRow = {
  booksellerCode: string;
  booksellerSubCode: string | null;
  sourceRow: number | null;
  actualDiscount: string | null;
  address01?: string | null;
  incumbentCode?: string | null;
};

const text = (value: unknown) => String(value ?? "").trim() || null;
export const discountKey = (row: Pick<DiscountRow, "booksellerCode" | "booksellerSubCode">) =>
  JSON.stringify([row.booksellerCode.trim(), text(row.booksellerSubCode)]);

export function parseDiscountRows(values: unknown[][]): DiscountRow[] {
  const header = values[0]?.map(value => String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase());
  if (header?.[2] !== "bookseller code" || header?.[3] !== "2_bookseller sub code" || header?.[17] !== "actual discount") {
    throw new Error("Expected Bookseller headers in columns C, D and R.");
  }
  const result = values.slice(1).flatMap((row, index) => {
    const booksellerCode = text(row[2]);
    if (!booksellerCode) {
      if (text(row[17])) throw new Error(`Discount without bookseller code at row ${index + 2}.`);
      return [];
    }
    return [{ booksellerCode, booksellerSubCode: text(row[3]), sourceRow: index + 2, actualDiscount: text(row[17]), address01: text(row[6]), incumbentCode: text(row[11]) }];
  });
  if (!result.length) throw new Error("No bookseller records in source.");
  return result;
}

export function matchDiscountRows<T extends DiscountRow>(source: DiscountRow[], existing: T[]) {
  const sourceByKey = new Map<string, DiscountRow[]>();
  const existingByKey = new Map<string, T[]>();
  for (const row of source) sourceByKey.set(discountKey(row), [...(sourceByKey.get(discountKey(row)) ?? []), row]);
  for (const row of existing) existingByKey.set(discountKey(row), [...(existingByKey.get(discountKey(row)) ?? []), row]);
  const matched: { existing: T; source: DiscountRow }[] = [];
  const unmatched: DiscountRow[] = [];
  for (const [key, rows] of sourceByKey) {
    const candidates = existingByKey.get(key) ?? [];
    if (!candidates.length) { unmatched.push(...rows); continue; }
    if (rows.length === 1 && candidates.length === 1) {
      matched.push({ existing: candidates[0], source: rows[0] });
      continue;
    }
    const used = new Set<T>();
    for (const row of rows) {
      const hasIdentity = Boolean(row.address01 && row.incumbentCode && candidates.every(candidate => candidate.address01 && candidate.incumbentCode));
      const exact = candidates.filter(candidate => hasIdentity
        ? candidate.address01?.trim() === row.address01?.trim() && candidate.incumbentCode?.trim() === row.incumbentCode?.trim()
        : candidate.sourceRow != null && candidate.sourceRow === row.sourceRow);
      if (!exact.length && hasIdentity) { unmatched.push(row); continue; }
      if (exact.length !== 1 || used.has(exact[0])) throw new Error(`Ambiguous bookseller ${key} at source row ${row.sourceRow}; no changes applied.`);
      used.add(exact[0]);
      matched.push({ existing: exact[0], source: row });
    }
  }
  return { matched, unmatched };
}

// Keep identical to the code assignment used by replaceVendorsWithImportedBooksellers.
export function assignDiscountVendorCodes<T extends { booksellerCode: string; booksellerSubCode?: string | null; booksellerName: string }>(rows: T[]) {
  const used = new Map<string, number>();
  return [...rows].sort((a, b) => a.booksellerName.localeCompare(b.booksellerName) || a.booksellerCode.localeCompare(b.booksellerCode)).map(row => {
    const sub = text(row.booksellerSubCode);
    const preferred = sub ? `${row.booksellerCode}-${sub}` : row.booksellerCode;
    const count = used.get(preferred) ?? 0;
    used.set(preferred, count + 1);
    return { row, vendorCode: count ? `${preferred}-${String(count + 1).padStart(2, "0")}` : preferred };
  });
}
