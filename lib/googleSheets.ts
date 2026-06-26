import { google, sheets_v4 } from "googleapis";

export type GoogleSheetCell = string | number | boolean | null;

export type GoogleSheetRow = {
  rowNumber: number;
  values: GoogleSheetCell[];
};

const GOOGLE_SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRangeStartRow(range: string) {
  const rangePart = range.includes("!") ? range.split("!").pop() ?? range : range;
  const match = rangePart.match(/[A-Za-z]+(\d+)/);

  if (!match) {
    return 1;
  }

  return Number.parseInt(match[1], 10);
}

function createGoogleSheetsClient(): sheets_v4.Sheets {
  const auth = new google.auth.GoogleAuth({
    scopes: GOOGLE_SHEETS_SCOPES
  });

  return google.sheets({
    version: "v4",
    auth
  });
}

export async function readGoogleSheetRows(): Promise<GoogleSheetRow[]> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEETS_ID");
  const range = getRequiredEnv("GOOGLE_SHEETS_RANGE");

  const sheets = createGoogleSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE"
  });

  const values = response.data.values ?? [];
  const startRow = getRangeStartRow(range);

  return values.map((row, index) => ({
    rowNumber: startRow + index,
    values: row.map((cell) => {
      if (cell === "" || cell === undefined) {
        return null;
      }

      if (typeof cell === "string" || typeof cell === "number" || typeof cell === "boolean") {
        return cell;
      }

      return String(cell);
    })
  }));
}
