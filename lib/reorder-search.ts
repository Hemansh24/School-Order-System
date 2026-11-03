import { Prisma } from "@prisma/client";
import type { EndUser } from "./end-user-type";

export type ReorderSearchResult = {
  orderSheet1Id: number;
  orderNo: number;
  sessionYear: string | null;
  billingToName: string;
  billingToCode: string | null;
  orderStatus: string;
  schools: EndUser[];
};

export type ReorderSearchResponse =
  | { ok: true; orders: ReorderSearchResult[]; hasMore: boolean }
  | { ok: false; message: string };

// Parameterized SQL supports partial matching of the numeric order number, too.
export function reorderSearchQuery(search: string) {
  const terms = search.trim().split(/\s+/).filter(Boolean);
  const predicates = terms.map(term => {
    const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
    return Prisma.sql`(
      o.order_no::text ILIKE ${pattern}
      OR o.billing_to_name ILIKE ${pattern}
      OR o.billing_to_code ILIKE ${pattern}
      OR EXISTS (SELECT 1 FROM order_sheet_2a s WHERE s.order_sheet_1_id = o.order_sheet_1_id
        AND (s.school_name ILIKE ${pattern} OR s.school_code ILIKE ${pattern}))
      OR EXISTS (SELECT 1 FROM order_sheet_2c1 s WHERE s.order_sheet_1_id = o.order_sheet_1_id
        AND (s.school_name ILIKE ${pattern} OR s.school_code ILIKE ${pattern}))
      OR EXISTS (SELECT 1 FROM order_group_participants s WHERE s.order_sheet_1_id = o.order_sheet_1_id
        AND (s.school_name ILIKE ${pattern} OR s.pt_code ILIKE ${pattern}))
    )`;
  });
  return Prisma.sql`SELECT o.order_sheet_1_id AS "orderSheet1Id" FROM order_sheet_1 o
    WHERE o.classification = 'normal' AND ${predicates.length ? Prisma.join(predicates, " AND ") : Prisma.sql`FALSE`}
    ORDER BY o.order_no DESC, o.order_sheet_1_id DESC LIMIT 21`;
}
