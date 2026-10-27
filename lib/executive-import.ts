export type ImportedExecutive = {
  incumbentCode: string; name: string; mobile: string | null;
  email: string | null; baseLocation: string | null;
};

export function parseExecutiveRows(rows: unknown[][]): ImportedExecutive[] {
  const text = (value: unknown) => value == null ? "" : String(value).trim();
  const header = rows.findIndex(row => row.some(value => text(value).toLowerCase() === "incumbent code"));
  if (header < 0) throw new Error("Incumbent Code header is missing.");
  const labels = rows[header].map(value => text(value).toLowerCase());
  const column = (label: string) => {
    const index = labels.indexOf(label);
    if (index < 0) throw new Error(`Missing column: ${label}`);
    return index;
  };
  const columns = {
    incumbentCode: column("incumbent code"), name: column("employees/directors"),
    mobile: column("mobile no."), email: column("email. id"), baseLocation: column("base location")
  };
  const records = new Map<string, ImportedExecutive>();
  rows.slice(header + 1).forEach((row, offset) => {
    if (!row.some(value => text(value))) return;
    const record: ImportedExecutive = {
      incumbentCode: text(row[columns.incumbentCode]).toUpperCase(), name: text(row[columns.name]),
      mobile: text(row[columns.mobile]) || null, email: text(row[columns.email]) || null,
      baseLocation: text(row[columns.baseLocation]) || null
    };
    const rowNumber = header + offset + 2;
    if (!record.incumbentCode || !record.name) throw new Error(`Row ${rowNumber}: incumbent code and name are required.`);
    const previous = records.get(record.incumbentCode);
    if (previous && JSON.stringify(previous) !== JSON.stringify(record)) {
      throw new Error(`Row ${rowNumber}: conflicting duplicate incumbent code ${record.incumbentCode}.`);
    }
    records.set(record.incumbentCode, record);
  });
  if (!records.size) throw new Error("No executive records found; import cancelled.");
  return [...records.values()];
}
