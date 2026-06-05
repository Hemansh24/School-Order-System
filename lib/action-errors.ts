import { Prisma } from "@prisma/client";
import { z } from "zod";

type FormatActionErrorOptions = {
  fallback: string;
  duplicate?: string;
};

function normalizeMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function formatActionError(
  error: unknown,
  { fallback, duplicate }: FormatActionErrorOptions
) {
  if (error instanceof z.ZodError) {
    return normalizeMessage(error.issues[0]?.message ?? fallback);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    if (duplicate && error.code === "P2002") {
      return normalizeMessage(duplicate);
    }

    if (error.code === "P2003" || error.code === "P2014") {
      return "This record is still in use and cannot be deleted yet.";
    }

    if (error.code === "P2025") {
      return "This record no longer exists.";
    }
  }

  if (error instanceof Error) {
    return normalizeMessage(error.message || fallback);
  }

  return normalizeMessage(fallback);
}
