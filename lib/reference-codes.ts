import { prisma } from "@/lib/prisma";

function nextCode(prefix: string, existingCodes: string[]) {
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

export async function nextSchoolCode() {
  const schools = await prisma.school.findMany({ select: { schoolCode: true } });
  return nextCode(
    "SCH",
    schools.map((school) => school.schoolCode)
  );
}

export async function nextVendorCode() {
  const vendors = await prisma.vendor.findMany({ select: { vendorCode: true } });
  return nextCode(
    "VEN",
    vendors.map((vendor) => vendor.vendorCode)
  );
}
