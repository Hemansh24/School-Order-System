"use server";

import { revalidatePath } from "next/cache";
import { formatActionError } from "@/lib/action-errors";
import { prisma } from "@/lib/prisma";
import {
  createOrReuseOrganisation,
  normalizeOrganisationInput
} from "@/lib/services/organisations";
import { nextOrganisationPrCode } from "@/lib/reference-codes";
import { createOrganisationSchema } from "@/lib/validation/reference";

export type OrganisationActionState = {
  ok: boolean;
  message?: string;
  organisation?: {
    id: string;
    prCode: string;
    ptCode: string | null;
    organisationName: string;
  };
  created?: boolean;
};

function revalidateOrganisationPaths(organisationId?: bigint) {
  revalidatePath("/organisations");
  revalidatePath("/orders/new");
  revalidatePath("/orders");
  if (organisationId !== undefined) {
    revalidatePath(`/organisations/${organisationId.toString()}/edit`);
  }
}

function organisationActionMessage(error: unknown, fallback: string) {
  return formatActionError(error, {
    fallback,
    duplicate: fallback
  });
}

function parseOrganisationForm(formData: FormData, prCode: string) {
  return createOrganisationSchema.parse({
    prCode,
    groupCode: formData.get("groupCode"),
    organisationName: formData.get("organisationName"),
    address: formData.get("address"),
    district: formData.get("district"),
    state: formData.get("state"),
    pinCode: formData.get("pinCode"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    actionStatus: formData.get("actionStatus"),
    remark: formData.get("remark"),
    academicYear: formData.get("academicYear"),
    strength: formData.get("strength"),
    boardType: formData.get("boardType"),
    sessionStartFrom: formData.get("sessionStartFrom"),
    minorityType: formData.get("minorityType"),
    saturdayStatus: formData.get("saturdayStatus"),
    workingStatus: formData.get("workingStatus")
  });
}

export async function createOrganisationAction(
  _previousState: OrganisationActionState,
  formData: FormData
): Promise<OrganisationActionState> {
  try {
    const prCode = await nextOrganisationPrCode();
    const parsed = parseOrganisationForm(formData, prCode);
    const result = await createOrReuseOrganisation(parsed);

    revalidateOrganisationPaths(result.organisation.id);
    return {
      ok: true,
      created: result.created,
      organisation: {
        id: result.organisation.id.toString(),
        prCode: result.organisation.prCode,
        ptCode: result.organisation.ptCode,
        organisationName: result.organisation.organisationName
      },
      message: result.created
        ? `Organisation added with PR code ${result.organisation.prCode}. PT code will be assigned on the first order.`
        : `Exact match found. Reusing ${result.organisation.prCode}.`
    };
  } catch (error) {
    return {
      ok: false,
      message: organisationActionMessage(
        error,
        "Could not save this organisation. Please review the form and try again."
      )
    };
  }
}

export async function updateOrganisationAction(
  organisationId: string,
  _previousState: OrganisationActionState,
  formData: FormData
): Promise<OrganisationActionState> {
  try {
    const id = BigInt(organisationId);
    const existing = await prisma.organisation.findUnique({
      where: { id },
      select: { id: true, prCode: true, ptCode: true }
    });

    if (!existing) {
      throw new Error("Organisation not found.");
    }

    const parsed = parseOrganisationForm(formData, existing.prCode);
    const normalized = normalizeOrganisationInput(parsed);

    const duplicate = await prisma.organisation.findFirst({
      where: {
        id: { not: id },
        organisationName: { equals: normalized.organisationName, mode: "insensitive" },
        address: { equals: normalized.address, mode: "insensitive" },
        district: { equals: normalized.district, mode: "insensitive" },
        state: { equals: normalized.state, mode: "insensitive" },
        pinCode: { equals: normalized.pinCode, mode: "insensitive" }
      },
      select: { id: true }
    });

    if (duplicate) {
      throw new Error("An organisation with the same name and address already exists.");
    }

    await prisma.organisation.update({
      where: { id },
      data: {
        groupCode: normalized.groupCode,
        organisationName: normalized.organisationName,
        address: normalized.address,
        district: normalized.district,
        state: normalized.state,
        pinCode: normalized.pinCode,
        phone: normalized.phone,
        email: normalized.email,
        website: normalized.website,
        actionStatus: normalized.actionStatus,
        remark: normalized.remark,
        academicYear: normalized.academicYear,
        strength: normalized.strength,
        boardType: normalized.boardType,
        sessionStartFrom: normalized.sessionStartFrom,
        minorityType: normalized.minorityType,
        saturdayStatus: normalized.saturdayStatus,
        workingStatus: normalized.workingStatus
      }
    });

    revalidateOrganisationPaths(id);
    return { ok: true, message: "Organisation saved." };
  } catch (error) {
    return {
      ok: false,
      message: organisationActionMessage(
        error,
        "Could not update this organisation. Please review the form and try again."
      )
    };
  }
}

export async function deleteOrganisationAction(
  organisationId: string,
  _previousState: OrganisationActionState,
  _formData: FormData
): Promise<OrganisationActionState> {
  try {
    const id = BigInt(organisationId);
    await prisma.organisation.delete({ where: { id } });
    revalidateOrganisationPaths(id);
    return { ok: true, message: "Organisation deleted." };
  } catch (error) {
    return {
      ok: false,
      message: organisationActionMessage(
        error,
        "Could not delete this organisation. Please try again."
      )
    };
  }
}
