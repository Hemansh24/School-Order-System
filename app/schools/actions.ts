"use server";

import { revalidatePath } from "next/cache";
import { formatActionError } from "@/lib/action-errors";
import { prisma } from "@/lib/prisma";
import { nextSchoolCode } from "@/lib/reference-codes";
import { createOrReuseSchool, findSchoolsByFields, type SchoolMatch } from "@/lib/services/schools";
import { createSchoolSchema, lookupSchoolSchema } from "@/lib/validation/reference";

export type ReferenceActionState = {
  ok: boolean;
  message?: string;
  school?: {
    schoolId: number;
    schoolCode: string;
    schoolName: string;
  };
  matches?: SchoolMatch[];
  created?: boolean;
};

function schoolActionMessage(error: unknown, fallback: string) {
  return formatActionError(error, {
    fallback,
    duplicate: fallback
  });
}

function revalidateSchoolPaths(schoolId?: number) {
  revalidatePath("/schools");
  revalidatePath("/vendors");
  revalidatePath("/orders/new");
  revalidatePath("/orders");
  if (schoolId !== undefined) {
    revalidatePath(`/schools/${schoolId}/edit`);
  }
}

function hasCompleteLookupDetails(parsed: {
  schoolName?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
}) {
  return Boolean(
    parsed.schoolName && parsed.address && parsed.district && parsed.state && parsed.pincode
  );
}

export async function createSchoolAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const schoolCode = await nextSchoolCode();
    const parsed = createSchoolSchema.parse({
      schoolCode,
      schoolName: formData.get("schoolName"),
      address: formData.get("address"),
      district: formData.get("district"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email")
    });

    const result = await createOrReuseSchool({
      ...parsed,
      schoolName: parsed.schoolName
    });

    revalidateSchoolPaths();
    return {
      ok: true,
      created: result.created,
      school: {
        schoolId: result.school.schoolId,
        schoolCode: result.school.schoolCode,
        schoolName: result.school.schoolName
      },
      message: result.created
        ? `School added with code ${result.school.schoolCode}.`
        : `Exact match found. Reusing ${result.school.schoolCode}.`
    };
  } catch (error) {
    return {
      ok: false,
      message: schoolActionMessage(
        error,
        "Could not save this school. Please review the form and try again."
      )
    };
  }
}

export async function lookupSchoolAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const parsed = lookupSchoolSchema.parse({
      schoolName: formData.get("schoolName"),
      address: formData.get("address"),
      district: formData.get("district"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email")
    });

    const matches = await findSchoolsByFields(parsed);
    const hasCompleteDetails = hasCompleteLookupDetails(parsed);

    if (!hasCompleteDetails) {
      return {
        ok: matches.length > 0,
        matches,
        message:
          matches.length > 0
            ? `Found ${matches.length} matching school${matches.length === 1 ? "" : "s"}.`
            : "No matching schools found for the entered fields."
      };
    }

    if (!parsed.schoolName) {
      return {
        ok: matches.length > 0,
        matches,
        message:
          matches.length > 0
            ? `Found ${matches.length} matching school${matches.length === 1 ? "" : "s"}.`
            : "Add the school name as well if you want to create a new school code."
      };
    }

    const result = await createOrReuseSchool({
      ...parsed,
      schoolName: parsed.schoolName
    });

    revalidateSchoolPaths();
    return {
      ok: true,
      created: result.created,
      matches: matches.length > 1 ? matches : undefined,
      school: {
        schoolId: result.school.schoolId,
        schoolCode: result.school.schoolCode,
        schoolName: result.school.schoolName
      },
      message: result.created
        ? `New school created with code ${result.school.schoolCode}.`
        : `Exact match found. Reusing ${result.school.schoolCode}.`
    };
  } catch (error) {
    return {
      ok: false,
      message: schoolActionMessage(
        error,
        "Could not check this school. Please review the details and try again."
      )
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
      schoolName: formData.get("schoolName"),
      address: formData.get("address"),
      district: formData.get("district"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email")
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
      throw new Error("A school with this name already exists.");
    }

    await prisma.school.update({
      where: { schoolId },
      data: {
        schoolName: parsed.schoolName,
        address: parsed.address,
        district: parsed.district,
        state: parsed.state,
        pincode: parsed.pincode,
        contactPerson: parsed.contactPerson,
        phone: parsed.phone,
        email: parsed.email
      }
    });

    revalidateSchoolPaths(schoolId);
    return { ok: true, message: "School saved." };
  } catch (error) {
    return {
      ok: false,
      message: schoolActionMessage(
        error,
        "Could not update this school. Please review the form and try again."
      )
    };
  }
}

export async function deleteSchoolAction(
  schoolId: number,
  _previousState: ReferenceActionState,
  _formData: FormData
): Promise<ReferenceActionState> {
  try {
    await prisma.school.delete({
      where: { schoolId }
    });

    revalidateSchoolPaths(schoolId);
    return { ok: true, message: "School deleted." };
  } catch (error) {
    return {
      ok: false,
      message: schoolActionMessage(error, "Could not delete this school. Please try again.")
    };
  }
}
