import Link from "next/link";
import { ButtonLink, Card, PageHeader, StatusPill } from "@/components/ui";
import { InlineActionForm } from "@/components/inline-action-form";
import { prisma } from "@/lib/prisma";
import { importPreBooksellersAction } from "./actions";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

const columns = [
  ["Source BS", "sourceBsCode"], ["Status", "conversionStatus"], ["Organisation", "vendorName"],
  ["Address", "address"], ["District", "district"], ["State", "state"], ["Pin Code", "pinCode"],
  ["Contact", "contactPerson"], ["Email", "email"], ["GST/PAN/TAN", "taxId"],
  ["School Deals", "schoolDealCount"], ["Approx. Strength", "approximateStrength"], ["Group Schools", "groupSchoolCount"],
  ["Committed Discount", "committedDiscount"], ["Transport", "transportCollaboration"], ["Booking Station", "bookingStation"],
  ["Vendor Type", "vendorType"], ["Payment Status", "paymentStatus"], ["Assigned BS", "assignedBsCode"]
] as const;

export default async function PreBooksellersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const total = await prisma.preBookseller.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const records = await prisma.preBookseller.findMany({ orderBy: { pbsCode: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });

  return <>
    <PageHeader title="Pre-Booksellers" description="PBS prospects imported into the database from the Pre_Bookseller_Sheet." action={<div className="flex gap-2"><InlineActionForm action={importPreBooksellersAction}>Import PBS Data</InlineActionForm><ButtonLink href="/pre-booksellers/conversion">BS Conversion</ButtonLink></div>} />
    <Card>
      <div className="overflow-x-auto"><table className="w-full min-w-[2600px] text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr><th className="px-4 py-3">PBS Code</th>{columns.map(([label]) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-line">{records.map((record) => <tr key={record.preBooksellerId}><td className="px-4 py-3 font-semibold"><div>{record.pbsCode}</div><Link href={`/pre-booksellers/${record.preBooksellerId}/edit`} className="mt-1 block text-xs text-brand-dark">Edit</Link></td>{columns.map(([, key]) => <td key={key} className="px-4 py-3">{key === "conversionStatus" ? <StatusPill value={record.conversionStatus}/> : record[key] ?? "—"}</td>)}</tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-line p-4 text-sm text-muted"><span>Showing {(page - 1) * PAGE_SIZE + (records.length ? 1 : 0)}–{Math.min(page * PAGE_SIZE, total)} of {total} PBS records · Page {page} of {totalPages}</span><div className="flex gap-3">{page > 1 ? <Link href={`/pre-booksellers?page=${page - 1}`} className="font-semibold text-brand-dark">Previous</Link> : null}{page < totalPages ? <Link href={`/pre-booksellers?page=${page + 1}`} className="font-semibold text-brand-dark">Next</Link> : null}</div></div>
    </Card>
  </>;
}
