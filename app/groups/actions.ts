"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importGsGroups } from "@/lib/importGsGroups";
import { syncChristianGroups } from "@/lib/syncGroups";

export async function syncGsAction() {
  let destination: string;
  try {
    const summary = await importGsGroups(undefined, true);
    revalidatePath("/groups"); revalidatePath("/orders/new"); revalidatePath("/orders/group/new");
    destination = `/groups?message=${encodeURIComponent(`Imported ${summary.groups} GS groups and ${summary.locations} locations.`)}`;
  } catch (error) {
    destination = `/groups?error=${encodeURIComponent(`GS refresh failed; check Google Sheets read access. ${error instanceof Error ? error.message : "Unknown error"}`)}`;
  }
  redirect(destination);
}
export async function syncChristianAction() {
  let destination: string;
  try {
    const summary = await syncChristianGroups();
    revalidatePath("/groups");
    destination = `/groups?message=${encodeURIComponent(`Synced ${summary.christianGroups} Christian groups.`)}`;
  } catch (error) { destination = `/groups?error=${encodeURIComponent(error instanceof Error ? error.message : "Christian sync failed.")}`; }
  redirect(destination);
}
