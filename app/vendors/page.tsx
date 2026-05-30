import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { deleteVendorAction } from "@/app/vendors/actions";
import { AddVendorForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";
import { nextVendorCode } from "@/lib/reference-codes";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const [vendors, schools, vendorCode] = await Promise.all([
    prisma.vendor.findMany({
      orderBy: { vendorName: "asc" },
      include: { vendorSchools: { include: { school: true } } }
    }),
    prisma.school.findMany({ orderBy: { schoolName: "asc" } }),
    nextVendorCode()
  ]);

  return (
    <>
      <PageHeader title="Vendors" description="Booksellers must remain linked to at least one school." />
      <AddVendorForm schools={schools} nextCode={vendorCode} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
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
                  <td className="px-4 py-3 font-semibold text-ink">{vendor.vendorCode}</td>
                  <td className="px-4 py-3">{vendor.vendorName}</td>
                  <td className="px-4 py-3 text-muted">{vendor.vendorType}</td>
                  <td className="px-4 py-3 text-muted">{vendor.vendorRating}</td>
                  <td className="px-4 py-3 text-muted">
                    {vendor.vendorSchools.map((row) => row.school.schoolName).join(", ")}
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
                      <form action={deleteVendorAction.bind(null, vendor.vendorId)}>
                        <button type="submit" className="font-semibold text-red-700">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
