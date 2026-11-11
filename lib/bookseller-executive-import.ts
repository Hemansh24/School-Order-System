type Cell = string | number | boolean | null;

export function parseBooksellerExecutiveRows(input: unknown) {
  if (!Array.isArray(input) || !input.every(row => Array.isArray(row)
    && row.every(cell => cell === null || ["string", "number", "boolean"].includes(typeof cell)))) {
    throw new Error("Expected a JSON array of sheet rows containing plain cell values.");
  }
  const rows = input as Cell[][];
  const text = (value: Cell | undefined) => value == null ? "" : String(value).trim();
  const labels = (rows[0] ?? []).map(value => text(value).toLowerCase());
  const column = (label: string) => {
    const index = labels.indexOf(label);
    if (index < 0) throw new Error(`Missing column: ${label}`);
    return index;
  };
  const columns = {
    pbsCode: column("pre_bs_code"), incumbentCode: column("incumbent code"),
    name: column("name"), designation: column("designation"),
    contact1: column("contact 1"), contact2: column("contact 2"),
    email: column("mail id"), aadhaarCardNo: column("aadhaar card no.")
  };
  const records = rows.slice(1).flatMap((row, offset) => {
    if (!row.some(cell => text(cell))) return [];
    const sourceSheetRow = offset + 2;
    const pbsCode = text(row[columns.pbsCode]);
    const incumbentCode = text(row[columns.incumbentCode]);
    const name = text(row[columns.name]);
    if (!pbsCode || !incumbentCode || !name) {
      throw new Error(`Row ${sourceSheetRow}: PBS code, incumbent code and name are required.`);
    }
    return [{ pbsCode, incumbentCode, name, designation: text(row[columns.designation]) || null,
      contact1: text(row[columns.contact1]) || null, contact2: text(row[columns.contact2]) || null,
      email: text(row[columns.email]) || null, aadhaarCardNo: text(row[columns.aadhaarCardNo]) || null,
      sourceSheetRow, sourceValues: row }];
  });
  if (!records.length) throw new Error("No bookseller executive records found; import cancelled.");
  return records;
}
