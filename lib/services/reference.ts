import { prisma } from "@/lib/prisma";
import { compareEditionCodes, DEFAULT_LANGUAGE_CODE } from "@/lib/item-code";

export async function getReferenceData() {
  const [schools, vendors, items] = await Promise.all([
    prisma.school.findMany({
      orderBy: { schoolName: "asc" },
      include: { schoolBranches: { orderBy: [{ branchName: "asc" }, { schoolBranchId: "asc" }] } }
    }),
    prisma.vendor.findMany({
      orderBy: { vendorName: "asc" },
      include: {
        vendorSchools: {
          include: {
            school: {
              include: {
                schoolBranches: { orderBy: [{ branchName: "asc" }, { schoolBranchId: "asc" }] }
              }
            }
          }
        }
      }
    }),
    prisma.item.findMany({
      where: { active: true, obsolete: false },
      orderBy: [{ categoryCode: "asc" }, { subCategoryCode: "asc" }, { itemName: "asc" }]
    })
  ]);

  return { schools, vendors, items };
}

export async function getItemCategories() {
  const items = await prisma.item.findMany({
    where: { active: true, obsolete: false },
    select: {
      itemCode: true,
      categoryCode: true,
      categoryType: true,
      subCategoryCode: true,
      languageCode: true,
      customisationCode: true,
      editionCode: true
    },
    orderBy: [{ categoryCode: "asc" }, { categoryType: "asc" }]
  });

  return Array.from(
    new Map(
      items.map((item) => [
        item.categoryCode,
        { categoryCode: item.categoryCode, categoryType: item.categoryType }
      ])
    ).values()
  );
}

export async function getCustomisationsByCategory(categoryCode: string) {
  const items = await prisma.item.findMany({
    where: { active: true, obsolete: false, categoryCode },
    select: {
      itemCode: true,
      categoryCode: true,
      subCategoryCode: true,
      languageCode: true,
      customisationCode: true,
      customisationName: true,
      editionCode: true
    },
    orderBy: [{ customisationName: "asc" }, { customisationCode: "asc" }]
  });

  return Array.from(
    new Map(
      items.map((item) => [
        item.customisationCode,
        {
          customisationCode: item.customisationCode,
          customisationName: item.customisationName
        }
      ])
    ).values()
  );
}

export async function getLatestItemsForOrderSelection(
  categoryCode: string,
  customisationCode: string
) {
  const items = await prisma.item.findMany({
    where: {
      active: true,
      obsolete: false,
      categoryCode,
      customisationCode,
      languageCode: DEFAULT_LANGUAGE_CODE
    },
    orderBy: [{ subCategoryCode: "asc" }, { itemName: "asc" }]
  });

  const latestEditionCode = items
    .map((item) => item.editionCode)
    .sort(compareEditionCodes)
    .at(-1);

  return items
    .filter((item) => item.editionCode === latestEditionCode)
    .sort((left, right) =>
      left.subCategoryCode.localeCompare(right.subCategoryCode, undefined, { numeric: true }) ||
      left.itemName.localeCompare(right.itemName)
    );
}

export async function validateItemCodeUnique(itemCode: string, itemId?: number) {
  const existing = await prisma.item.findUnique({ where: { itemCode } });
  return !existing || existing.itemId === itemId;
}
