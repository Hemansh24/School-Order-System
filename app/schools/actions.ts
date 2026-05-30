"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nextSchoolCode } from "@/lib/reference-codes";
import {
  createSchoolBranchSchema,
  createSchoolSchema,
  schoolBranchDraftSchema
} from "@/lib/validation/reference";

export type ReferenceActionState = {
  ok: boolean;
  message?: string;
  existingSchool?: {
    schoolId: number;
    schoolCode: string;
    schoolName: string;
  };
};

function duplicateMessage(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return fallback;
  }

  return error instanceof Error ? error.message : "Could not save.";
}

function hasBranchDetails(branch: {
  branchName?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}) {
  return Boolean(
    branch.branchName || branch.address || branch.contactPerson || branch.phone || branch.email
  );
}

function revalidateSchoolPaths(schoolId?: number) {
  revalidatePath("/schools");
  revalidatePath("/vendors");
  revalidatePath("/orders/new");
  if (schoolId !== undefined) {
    revalidatePath(`/schools/${schoolId}/edit`);
  }
}

export async function createSchoolAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const intent = formData.get("intent");

    if (intent === "branch") {
      const parsed = createSchoolBranchSchema.parse({
        schoolId: formData.get("existingSchoolId"),
        branchName: formData.get("branchName"),
        address: formData.get("address"),
        contactPerson: formData.get("contactPerson"),
        phone: formData.get("phone"),
        email: formData.get("email")
      });

      const school = await prisma.school.findUnique({
        where: { schoolId: parsed.schoolId },
        select: { schoolId: true, schoolCode: true, schoolName: true }
      });
      if (!school) {
        throw new Error("School not found.");
      }

      await prisma.schoolBranch.create({
        data: {
          schoolId: school.schoolId,
          branchName: parsed.branchName,
          address: parsed.address,
          contactPerson: parsed.contactPerson,
          phone: parsed.phone,
          email: parsed.email
        }
      });

      revalidateSchoolPaths(school.schoolId);
      return { ok: true, message: `Branch added under ${school.schoolCode} - ${school.schoolName}.` };
    }

    const schoolCode = await nextSchoolCode();
    const parsed = createSchoolSchema.parse({
      schoolCode,
      schoolName: formData.get("schoolName")
    });
    const branchDraft = schoolBranchDraftSchema.parse({
      branchName: formData.get("branchName"),
      address: formData.get("address"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email")
    });

    const existingSchool = await prisma.school.findFirst({
      where: {
        schoolName: {
          equals: parsed.schoolName,
          mode: "insensitive"
        }
      },
      select: { schoolId: true, schoolCode: true, schoolName: true }
    });

    if (existingSchool) {
      return {
        ok: false,
        message: `${existingSchool.schoolCode} - ${existingSchool.schoolName} already exists. Add a branch instead.`,
        existingSchool
      };
    }

    const school = await prisma.school.create({
      data: {
        schoolCode: parsed.schoolCode,
        schoolName: parsed.schoolName
      }
    });

    if (hasBranchDetails(branchDraft)) {
      await prisma.schoolBranch.create({
        data: {
          schoolId: school.schoolId,
          branchName: branchDraft.branchName ?? "Main",
          address: branchDraft.address,
          contactPerson: branchDraft.contactPerson,
          phone: branchDraft.phone,
          email: branchDraft.email
        }
      });
    }

    revalidateSchoolPaths(school.schoolId);
    return { ok: true, message: "School added." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "A school or branch with this name already exists.")
    };
  }
}

export async function updateSchoolAction(
  schoolId: number,
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const existing = await prisma.school.findUnique({
      where: { schoolId },
      select: { schoolCode: true }
    });
    if (!existing) {
      throw new Error("School not found.");
    }

    const parsed = createSchoolSchema.parse({
      schoolCode: existing.schoolCode,
      schoolName: formData.get("schoolName")
    });

    const duplicate = await prisma.school.findFirst({
      where: {
        schoolId: { not: schoolId },
        schoolName: {
          equals: parsed.schoolName,
          mode: "insensitive"
        }
      },
      select: { schoolId: true }
    });

    if (duplicate) {
      throw new Error("A school with this name already exists. Rename branches instead.");
    }

    await prisma.school.update({
      where: { schoolId },
      data: {
        schoolName: parsed.schoolName
      }
    });

    revalidateSchoolPaths(schoolId);
    return { ok: true, message: "School saved." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "A school with this name already exists.")
    };
  }
}

export async function addSchoolBranchAction(
  schoolId: number,
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const school = await prisma.school.findUnique({
      where: { schoolId },
      select: { schoolId: true, schoolCode: true, schoolName: true }
    });
    if (!school) {
      throw new Error("School not found.");
    }

    const parsed = createSchoolBranchSchema.parse({
      schoolId,
      branchName: formData.get("branchName"),
      address: formData.get("address"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email")
    });

    await prisma.schoolBranch.create({
      data: {
        schoolId: parsed.schoolId,
        branchName: parsed.branchName,
        address: parsed.address,
        contactPerson: parsed.contactPerson,
        phone: parsed.phone,
        email: parsed.email
      }
    });

    revalidateSchoolPaths(schoolId);
    return { ok: true, message: `Branch added under ${school.schoolCode} - ${school.schoolName}.` };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "A branch with this name already exists for this school.")
    };
  }
}

export async function deleteSchoolAction(schoolId: number): Promise<void> {
  await prisma.school.delete({
    where: { schoolId }
  });

  revalidateSchoolPaths(schoolId);
}
