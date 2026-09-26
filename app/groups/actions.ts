"use server";
import { revalidatePath } from "next/cache";
import { confirmGroupMapping } from "@/lib/services/groups";
import { syncGroups } from "@/lib/syncGroups";

export async function syncGroupsAction() { await syncGroups(); revalidatePath("/groups"); }
export async function confirmGroupMappingAction(formData: FormData) {
  const ptCode = String(formData.get("ptCode") ?? "");
  const location = String(formData.get("locationId") ?? "");
  if (!ptCode) throw new Error("PT code is required.");
  await confirmGroupMapping(ptCode, location ? Number(location) : null);
  revalidatePath("/groups");
}
