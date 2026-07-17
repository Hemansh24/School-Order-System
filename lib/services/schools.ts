import { prisma } from "@/lib/prisma";
import { nextCode } from "@/lib/reference-codes";
import { ensureOrganisationForSchoolTx } from "@/lib/services/organisations";

type SchoolResolutionInput = {
  schoolName?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
};

type SchoolCreationInput = SchoolResolutionInput & {
  schoolName: string;
};

type SchoolSelection = {
  schoolId: number;
  schoolCode: string;
  schoolName: string;
  address: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
};

export type SchoolMatch = SchoolSelection;

function normalizeSchoolField(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isExactSchoolMatch(school: SchoolSelection, input: SchoolResolutionInput) {
  return (
    normalizeSchoolField(school.schoolName) === normalizeSchoolField(input.schoolName) &&
    normalizeSchoolField(school.address) === normalizeSchoolField(input.address) &&
    normalizeSchoolField(school.district) === normalizeSchoolField(input.district) &&
    normalizeSchoolField(school.state) === normalizeSchoolField(input.state) &&
    normalizeSchoolField(school.pincode) === normalizeSchoolField(input.pincode)
  );
}

function containsEnteredValue(source?: string | null, entered?: string | null) {
  const normalizedEntered = normalizeSchoolField(entered);
  if (!normalizedEntered) {
    return true;
  }

  return normalizeSchoolField(source).includes(normalizedEntered);
}

function matchesEnteredFields(school: SchoolSelection, input: SchoolResolutionInput) {
  if (!containsEnteredValue(school.schoolName, input.schoolName)) {
    return false;
  }

  if (!containsEnteredValue(school.address, input.address)) {
    return false;
  }

  if (!containsEnteredValue(school.district, input.district)) {
    return false;
  }

  if (!containsEnteredValue(school.state, input.state)) {
    return false;
  }

  if (!containsEnteredValue(school.pincode, input.pincode)) {
    return false;
  }

  return true;
}

export async function findSchoolsByFields(input: SchoolResolutionInput): Promise<SchoolMatch[]> {
  const schools = await prisma.school.findMany({
    select: {
      schoolId: true,
      schoolCode: true,
      schoolName: true,
      address: true,
      district: true,
      state: true,
      pincode: true
    },
    orderBy: [
      { schoolName: "asc" },
      { state: "asc" },
      { district: "asc" },
      { address: "asc" }
    ]
  });

  return schools.filter((school) => matchesEnteredFields(school, input));
}

export async function createOrReuseSchool(input: SchoolCreationInput) {
  return prisma.$transaction(async (tx) => {
    const schools = await tx.school.findMany({
      select: {
        schoolId: true,
        schoolCode: true,
        schoolName: true,
        address: true,
        district: true,
        state: true,
        pincode: true
      }
    });

    const existingSchool = schools.find((school) => isExactSchoolMatch(school, input));
    if (existingSchool) {
      await ensureOrganisationForSchoolTx(tx, {
        schoolName: existingSchool.schoolName,
        address: existingSchool.address,
        district: existingSchool.district,
        state: existingSchool.state,
        pincode: existingSchool.pincode,
        phone: input.phone,
        email: input.email
      });

      return {
        created: false as const,
        school: existingSchool
      };
    }

    const school = await tx.school.create({
      data: {
        schoolCode: nextCode(
          "SCH",
          schools.map((candidate) => candidate.schoolCode)
        ),
        schoolName: input.schoolName.trim(),
        address: input.address?.trim() || null,
        district: input.district?.trim() || null,
        state: input.state?.trim() || null,
        pincode: input.pincode?.trim() || null,
        contactPerson: input.contactPerson?.trim() || null,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null
      },
      select: {
        schoolId: true,
        schoolCode: true,
        schoolName: true,
        address: true,
        district: true,
        state: true,
        pincode: true
      }
    });

    await ensureOrganisationForSchoolTx(tx, {
      schoolName: school.schoolName,
      address: school.address,
      district: school.district,
      state: school.state,
      pincode: school.pincode,
      phone: input.phone,
      email: input.email
    });

    return {
      created: true as const,
      school
    };
  });
}
