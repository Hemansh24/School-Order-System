"use server";

import type { A2DInput } from "@/lib/a2d";
import { convertAmbiguousOrder } from "@/lib/services/a2d";
import { formatActionError } from "@/lib/action-errors";

export async function convertAmbiguousOrderAction(sourceOrderId: number, input: A2DInput) {
  try {
    if (!Number.isSafeInteger(sourceOrderId) || sourceOrderId <= 0) throw new Error("Invalid source order.");
    const result = await convertAmbiguousOrder(sourceOrderId, input);
    return { ok: true as const, orderSheet1Id: result.orderSheet1Id };
  } catch (error) {
    return { ok: false as const, message: formatActionError(error, { fallback: "Could not convert this order. Please review the quantities and try again." }) };
  }
}
