"use server";

import { revalidatePath } from "next/cache";
import { formatActionError } from "@/lib/action-errors";
import { createOrReuseSchool, findSchoolsByFields, type SchoolMatch } from "@/lib/services/schools";
import { replaceSchoolsWithImportedOrganisations } from "@/lib/syncSchoolsFromOrganisations";
import { createSchoolSchema, lookupSchoolSchema } from "@/lib/validation/reference";

export type ReferenceActionState = {
  ok: boolean;
  message?: string;
  school?: {
    organisationId: string;
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

function revalidateSchoolPaths(organisationId?: string) {
  revalidatePath("/schools");
  revalidatePath("/organisations");
  revalidatePath("/vendors");
  revalidatePath("/orders/new");
  revalidatePath("/orders");
  if (organisationId !== undefined) {
    revalidatePath(`/schools/${organisationId}/edit`);
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
    const parsed = createSchoolSchema.parse({
      schoolCode: "PT-PENDING",
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
        organisationId: result.school.organisationId,
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
            : "Add the school name as well if you want to create a new PT/PR-backed reference."
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
        organisationId: result.school.organisationId,
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

export async function syncImportedOrganisationsAsSchoolsAction(
  _previousState: ReferenceActionState, _formData: FormData
): Promise<ReferenceActionState> {
  try {
    const summary = await replaceSchoolsWithImportedOrganisations();
    revalidateSchoolPaths();
    return { ok: true, message: `Imported ${summary.importedOrganisations} organisations; preserved ${summary.preservedVendorLinks} vendor links.` };
  } catch (error) {
    return { ok: false, message: schoolActionMessage(error, "Could not import organisations.") };
  }
}
