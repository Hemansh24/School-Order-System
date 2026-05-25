import { prisma } from "@/lib/prisma";

function nextCode(prefix: string, existingCodes: string[]) {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const maxNumber = existingCodes.reduce((currentMax, code) => {
    const match = code.match(pattern);
    if (!match) {
      return currentMax;
    }

    return Math.max(currentMax, Number(match[1]));
  }, 0);

  return `${prefix}-${String(maxNumber + 1).padStart(3, "0")}`;
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

