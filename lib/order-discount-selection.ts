export const normalizeDiscountCode = (code: string) => code.trim().toUpperCase()
  .replace(/^(BS\d+)\s*\((\d+)\)$/, "$1-$2");

type DiscountRow = { sourceRow: number; prCode: string | null; ptCode: string | null; billingToWhom: string | null; discount: string | null };

/** One vote per organisation, independent of item quantities or line counts. */
export function selectSchoolDiscount(rows: DiscountRow[], endUsers: string[][], billingCodes: string[]): string | null {
  const billing = new Set(billingCodes.map(normalizeDiscountCode));
  const votes: string[] = [];
  const seen = new Set<string>();
  for (const aliases of endUsers) {
    const codes = aliases.map(normalizeDiscountCode);
    if (codes.some(code => seen.has(code))) continue;
    codes.forEach(code => seen.add(code));
    const matches = rows.filter(row => row.billingToWhom && billing.has(normalizeDiscountCode(row.billingToWhom)) &&
      [row.prCode, row.ptCode].some(code => code && codes.includes(normalizeDiscountCode(code))))
      .sort((a, b) => a.sourceRow - b.sourceRow);
    const discount = matches.map(row => row.discount?.trim()).find(value => value && value !== "-");
    if (discount) votes.push(discount);
  }
  const counts = new Map<string, number>();
  for (const value of votes) counts.set(value, (counts.get(value) ?? 0) + 1);
  const highest = Math.max(0, ...counts.values());
  return votes.find(value => counts.get(value) === highest) ?? null;
}

export function discountEndUserCodes(input: {
  sheet1: { orderType: string; descriptiveMode?: string | null };
  descriptiveRows: { schoolCode: string }[];
  combinedSchools: { schoolCode: string }[];
}): string[] {
  if (input.sheet1.orderType === "ambiguous") return [];
  const pooled = ["multiple_schools", "multiple_group"].includes(input.sheet1.descriptiveMode ?? "");
  return [...new Set((pooled ? input.combinedSchools : input.descriptiveRows).map(row => row.schoolCode))];
}
