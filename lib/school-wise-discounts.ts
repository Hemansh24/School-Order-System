export const schoolDiscountHeaders = [
  "1_Pre Sale Schools Code_1", "1_Post School Code_2", "School Name", "District", "State",
  "Billing to whom", "Bookseller", "Discount", "Group Code", "Group Name"
] as const;

export const schoolDiscountFields = [
  "prCode", "ptCode", "schoolName", "district", "state", "billingToWhom",
  "bookseller", "discount", "groupCode", "groupName"
] as const;

export type SchoolDiscountData = Record<typeof schoolDiscountFields[number], string | null> & { sourceRow: number };

export function parseSchoolDiscountRows(values: unknown): SchoolDiscountData[] {
  if (!Array.isArray(values) || !Array.isArray(values[0]) ||
      schoolDiscountHeaders.some((header, index) => values[0][index] !== header)) {
    throw new Error("School wise Discount headers do not match the expected ten columns.");
  }
  const rows: SchoolDiscountData[] = [];
  for (let index = 1; index < values.length; index++) {
    const cells: unknown = values[index];
    if (!Array.isArray(cells)) throw new Error(`Invalid source row ${index + 1}.`);
    if (cells.some(cell => cell !== null && cell !== undefined && typeof cell !== "string")) {
      throw new Error(`Source row ${index + 1} must contain formatted text values.`);
    }
    if (!cells.some(cell => cell !== null && cell !== undefined && cell !== "")) continue;
    if (cells.slice(10).some(cell => cell !== null && cell !== undefined && cell !== "")) {
      throw new Error(`Unexpected extra columns in source row ${index + 1}.`);
    }
    const row = { sourceRow: index + 1 } as SchoolDiscountData;
    schoolDiscountFields.forEach((field, column) => {
      const value = cells[column];
      row[field] = value === "" || value === undefined || value === null ? null : value;
    });
    rows.push(row);
  }
  if (!rows.length) throw new Error("No school discount data rows found; import aborted.");
  return rows;
}
