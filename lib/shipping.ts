export type AddressParts = {
  address?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
};

function cleanPart(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

export function formatSchoolAddress(parts: AddressParts) {
  return [parts.address, parts.district, parts.state, parts.pincode]
    .map(cleanPart)
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export function formatVendorAddress(address?: string | null) {
  return cleanPart(address) ?? "";
}
