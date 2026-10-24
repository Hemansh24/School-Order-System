export type PtCodeUsage = { ptCode: string; sessionYear: string };

export function parsePtCodeUsageHistory(values: unknown): PtCodeUsage[] {
  if (!Array.isArray(values) || !values.every(Array.isArray)) {
    throw new Error("Expected a JSON array of sheet rows, including headers.");
  }
  const text = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
  const headers = values[0]?.map(text);
  if (headers?.[0] !== "1_Post School Code_2" || headers[1] !== "Academic Year wise Implementation") {
    throw new Error("Unexpected PT usage history headers.");
  }
  const rows = new Map<string, PtCodeUsage>();
  for (const [index, valuesRow] of values.slice(1).entries()) {
    const codeCell = text(valuesRow[0]).toUpperCase();
    const sessionYear = text(valuesRow[1]);
    if (!codeCell && !sessionYear) continue;
    // The source has two aggregate labels with no individual PT identity.
    if (codeCell === "GROUP") continue;
    const ptCodes = String(valuesRow[0] ?? "").trim().split(/[\r\n]+/).map(value => value.trim().toUpperCase());
    const year = /^(\d{4})-(\d{4})$/.exec(sessionYear);
    if (ptCodes.some(ptCode => !/^PT\d+$/.test(ptCode)) || !year || Number(year[2]) !== Number(year[1]) + 1) {
      throw new Error(`Invalid PT code or session year at sheet row ${index + 2}.`);
    }
    for (const ptCode of ptCodes) rows.set(`${ptCode}|${sessionYear}`, { ptCode, sessionYear });
  }
  if (!rows.size) throw new Error("PT usage history is empty; no import performed.");
  return [...rows.values()];
}
