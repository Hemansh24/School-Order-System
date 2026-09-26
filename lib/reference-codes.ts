import { prisma } from "@/lib/prisma";

export function nextCode(prefix: string, existingCodes: string[]) {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const usedNumbers = new Set(
    existingCodes.flatMap((code) => {
      const match = code.match(pattern);
      return match ? [Number(match[1])] : [];
    })
  );

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

export function nextCompactCode(prefix: string, existingCodes: string[], width = 6) {
  const pattern = new RegExp(`^${prefix}-?(\\d+)$`, "i");
  const usedNumbers = new Set(
    existingCodes.flatMap((code) => {
      const match = code.match(pattern);
      return match ? [Number(match[1])] : [];
    })
  );

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `${prefix}${String(nextNumber).padStart(width, "0")}`;
}

export function nextSequentialCompactCode(prefix: string, existingCodes: string[], width = 4) {
  const pattern = new RegExp(`^${prefix}-?(\\d+)$`, "i");
  const highestNumber = existingCodes.reduce((highest, code) => {
    const match = code.match(pattern);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `${prefix}${String(highestNumber + 1).padStart(width, "0")}`;
}

export async function nextVendorCode() {
  const vendors = await prisma.vendor.findMany({ select: { vendorCode: true } });
  return nextCode(
    "VEN",
    vendors.map((vendor) => vendor.vendorCode)
  );
}

export async function nextOrganisationPrCode() {
  const organisations = await prisma.organisation.findMany({ select: { prCode: true } });
  return nextCompactCode(
    "PR",
    organisations.map((organisation) => organisation.prCode)
  );
}

export async function nextOrganisationPtCode() {
  const organisations = await prisma.organisation.findMany({
    where: { ptCode: { not: null } },
    select: { ptCode: true }
  });
  return nextSequentialCompactCode(
    "PT",
    organisations.flatMap((organisation) => (organisation.ptCode ? [organisation.ptCode] : [])),
    4
  );
}
