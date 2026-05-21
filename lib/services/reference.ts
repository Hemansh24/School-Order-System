import { prisma } from "@/lib/prisma";

export async function getReferenceData() {
  const [schools, vendors, items] = await Promise.all([
    prisma.school.findMany({ orderBy: { schoolName: "asc" } }),
    prisma.vendor.findMany({
      orderBy: { vendorName: "asc" },
      include: { vendorSchools: { include: { school: true } } }
    }),
    prisma.item.findMany({ where: { active: true }, orderBy: { itemName: "asc" } })
  ]);

  return { schools, vendors, items };
}
