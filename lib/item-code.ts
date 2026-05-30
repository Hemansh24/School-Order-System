export const DEFAULT_LANGUAGE_CODE = "ENG";

export type ItemCodeInput = {
  categoryCode: string;
  subCategoryCode: string;
  languageCode?: string | null;
  customisationCode: string;
  editionCode: string;
};

function normalizeCodePart(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export function generateItemCode(input: ItemCodeInput) {
  return [
    normalizeCodePart(input.categoryCode),
    normalizeCodePart(input.subCategoryCode),
    normalizeCodePart(input.languageCode || DEFAULT_LANGUAGE_CODE),
    normalizeCodePart(input.customisationCode),
    normalizeCodePart(input.editionCode)
  ].join("-");
}

export function editionSortValue(editionCode: string | null | undefined) {
  const trimmed = (editionCode ?? "").trim();
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}

export function compareEditionCodes(a: string, b: string) {
  const left = editionSortValue(a);
  const right = editionSortValue(b);

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}
