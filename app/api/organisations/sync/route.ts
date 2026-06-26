import { NextResponse } from "next/server";

import { syncOrganisations } from "@/lib/syncOrganisations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const summary = await syncOrganisations();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Organisation sync request failed.", { error });

    return NextResponse.json(
      {
        error: "Failed to sync organisations from Google Sheets."
      },
      {
        status: 500
      }
    );
  }
}
