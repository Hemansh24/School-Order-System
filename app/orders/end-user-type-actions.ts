"use server";

import { z } from "zod";
import { getEndUserTypes } from "@/lib/services/end-user-types";

export async function getEndUserTypesAction(input: { codes: string[]; sessionYear: string; orderSheet1Id?: number }) {
  try {
    const parsed = z.object({
      codes: z.array(z.string().trim().regex(/^(PT-?\d+|PR-?\d+)$/i)).max(10000),
      sessionYear: z.string().trim().max(30),
      orderSheet1Id: z.number().int().positive().optional()
    }).parse(input);
    return { ok: true as const, types: await getEndUserTypes(parsed.codes, parsed.sessionYear, parsed.orderSheet1Id) };
  } catch {
    return { ok: false as const, message: "Type of End User is unavailable. Please try again." };
  }
}
