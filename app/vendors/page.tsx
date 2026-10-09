import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { deleteVendorAction, syncImportedBooksellersAction } from "@/app/vendors/actions";
import { InlineActionForm } from "@/components/inline-action-form";
import { AddVendorForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";
import { nextVendorCode } from "@/lib/reference-codes";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [total, vendors, schools, vendorCode, preBooksellers] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.findMany({
      orderBy: { vendorName: "asc" },
      include: { vendorSchools: { include: { school: true } }, convertedPreBookseller: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.school.findMany({ orderBy: { schoolName: "asc" } }),
    nextVendorCode(),
    prisma.preBookseller.findMany({
      where: { OR: [{ sourceBsCode: { not: null } }, { assignedBsCode: { not: null } }] },
      select: { pbsCode: true, sourceBsCode: true, assignedBsCode: true }
    })
  ]);
  const pbsCodeByBsCode = new Map(
    preBooksellers.flatMap((record) => [
      ...(record.sourceBsCode ? [[record.sourceBsCode, record.pbsCode] as const] : []),
      ...(record.assignedBsCode ? [[record.assignedBsCode, record.pbsCode] as const] : [])
    ])
  );
  const pbsCodeForVendor = (vendorCode: string) =>
    pbsCodeByBsCode.get(vendorCode) ?? pbsCodeByBsCode.get(vendorCode.replace(/-\d+$/, ""));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Vendors"
        description="Active vendors and booksellers available for orders. PBS history is managed in Pre-Booksellers."
        action={<InlineActionForm action={syncImportedBooksellersAction}>Replace With Imported Booksellers</InlineActionForm>}
      />
      <AddVendorForm schools={schools} nextCode={vendorCode} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
            <th className="px-4 py-3">PBS Code</th>
            <th className="px-4 py-3">BS Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Linked Schools</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {vendors.map((vendor) => (
                <tr key={vendor.vendorId}>
                  <td className="px-4 py-3 font-semibold text-ink">{vendor.convertedPreBookseller?.pbsCode ?? pbsCodeForVendor(vendor.vendorCode) ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{vendor.vendorCode}</td>
                  <td className="px-4 py-3">{vendor.vendorName}</td>
                  <td className="px-4 py-3 text-muted">{vendor.vendorType}</td>
                  <td className="px-4 py-3 text-muted">{vendor.vendorRating}</td>
                  <td className="px-4 py-3 text-muted">
                    {vendor.vendorSchools.length > 0
                      ? vendor.vendorSchools.map((row) => row.school.schoolName).join(", ")
                      : "Not linked"}
                  </td>
                  <td className="px-4 py-3 text-muted">{vendor.contactPerson}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/vendors/${vendor.vendorId}/edit`}
                        className="font-semibold text-brand-dark"
                      >
                        Edit
                      </Link>
                      <InlineActionForm
                        action={deleteVendorAction.bind(null, vendor.vendorId)}
                        variant="danger"
                      >
                        Delete
                      </InlineActionForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line p-4 text-sm text-muted">
          <span>Showing {(page - 1) * PAGE_SIZE + (vendors.length ? 1 : 0)}–{Math.min(page * PAGE_SIZE, total)} of {total} vendors · Page {page} of {totalPages}</span>
          <div className="flex gap-3">
            {page > 1 ? <Link href={`/vendors?page=${page - 1}`} className="font-semibold text-brand-dark">Previous</Link> : null}
            {page < totalPages ? <Link href={`/vendors?page=${page + 1}`} className="font-semibold text-brand-dark">Next</Link> : null}
          </div>
        </div>
      </Card>
    </>
  );
}
