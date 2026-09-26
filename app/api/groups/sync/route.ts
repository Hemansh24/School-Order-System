import { NextResponse } from "next/server";
import { syncGroups } from "@/lib/syncGroups";
export const runtime = "nodejs";
export async function POST() {
  try { return NextResponse.json(await syncGroups()); }
  catch { return NextResponse.json({ error: "Failed to sync Group Sheet." }, { status: 500 }); }
}
