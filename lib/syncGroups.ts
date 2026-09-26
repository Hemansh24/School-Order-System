import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { readGoogleSheetRows, type GoogleSheetCell } from "@/lib/googleSheets";

const GROUP_SHEET_ID = "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs";
const GROUP_RANGE = "'Group Sheet'!A1:M1000";

function text(value: GoogleSheetCell) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function syncGroups() {
  const spreadsheetId = process.env.GROUP_SHEETS_ID ?? GROUP_SHEET_ID;

  const rows = await readGoogleSheetRows({ spreadsheetId, range: GROUP_RANGE });
  const activeCodes = new Set<string>();
  let locations = 0;

  for (const row of rows.slice(1)) {
    const [groupCodeValue, subCodeValue, nameValue, , , , , addressValue, districtValue, stateValue, pincodeValue, centralizedValue] = row.values;
    const groupCode = text(groupCodeValue);
    const subCode = text(subCodeValue);
    const name = text(nameValue);
    if (!groupCode || !subCode || !name) continue;

    activeCodes.add(groupCode);
    const group = await prisma.schoolGroup.upsert({
      where: { groupCode },
      create: { groupCode, groupName: name, sourceHash: digest({ groupCode, name }), syncedAt: new Date() },
      update: { groupName: name, sourceHash: digest({ groupCode, name }), syncedAt: new Date() }
    });
    const data = {
      name,
      address: text(addressValue),
      district: text(districtValue),
      state: text(stateValue),
      pincode: text(pincodeValue),
      centralizedDecision: text(centralizedValue),
      sourceHash: digest(row.values),
      syncedAt: new Date()
    };
    await prisma.schoolGroupLocation.upsert({
      where: { schoolGroupId_subCode: { schoolGroupId: group.schoolGroupId, subCode } },
      create: { schoolGroupId: group.schoolGroupId, subCode, ...data },
      update: data
    });
    locations += 1;
  }

  const groups = await prisma.schoolGroup.findMany({ include: { locations: true } });
  const locationsByCode = new Map(groups.map((group) => [group.groupCode, group.locations]));
  const organisations = await prisma.organisation.findMany({
    where: { groupCode: { in: [...activeCodes] }, ptCode: { not: null } },
    select: { groupCode: true, ptCode: true, pinCode: true }
  });

  let suggestions = 0;
  for (const organisation of organisations) {
    if (!organisation.groupCode || !organisation.ptCode) continue;
    const matches = (locationsByCode.get(organisation.groupCode) ?? []).filter(
      (location) => !!organisation.pinCode && location.pincode === organisation.pinCode
    );
    const suggestedLocationId = matches.length === 1 ? matches[0].schoolGroupLocationId : null;
    const existing = await prisma.schoolGroupSchool.findUnique({ where: { ptCode: organisation.ptCode } });
    if (existing?.reviewedAt) continue;
    await prisma.schoolGroupSchool.upsert({
      where: { ptCode: organisation.ptCode },
      create: { ptCode: organisation.ptCode, suggestedLocationId },
      update: { suggestedLocationId }
    });
    if (suggestedLocationId) suggestions += 1;
  }

  return { groups: activeCodes.size, locations, suggestions };
}
