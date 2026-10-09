import Link from "next/link";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { InlineActionForm } from "@/components/inline-action-form";
import { prisma } from "@/lib/prisma";
import { getSuggestedBsCode } from "@/lib/services/pre-booksellers";
import { convertPreBooksellerAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function BsConversionPage({ searchParams }: { searchParams: Promise<{ pbs?: string }> }) {
  const { pbs } = await searchParams;
  const pending = await prisma.preBookseller.findMany({ where: { conversionStatus: "pending" }, orderBy: { pbsCode: "asc" } });
  const selected = pending.find((record) => record.preBooksellerId === Number(pbs));
  const suggestedBsCode = selected ? await getSuggestedBsCode(selected.preBooksellerId) : null;
  return <>
    <PageHeader title="BS Conversion" description="Select a PBS record to preview the Vendor/Bookseller that will be created." action={<Link href="/pre-booksellers" className="font-semibold text-brand-dark">Back to PBS data</Link>} />
    <Card className="mb-5 p-5"><form className="flex max-w-2xl flex-wrap items-end gap-3"><label className="flex-1 text-sm font-medium text-ink">PBS code<select name="pbs" defaultValue={selected?.preBooksellerId ?? ""} className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3"><option value="">Select a PBS code</option>{pending.map((record) => <option key={record.preBooksellerId} value={record.preBooksellerId}>{record.pbsCode} — {record.vendorName}</option>)}</select></label><SubmitButton type="submit">Preview conversion</SubmitButton></form></Card>
    {selected && suggestedBsCode ? <Card className="p-5"><div className="mb-5"><h2 className="text-lg font-semibold text-ink">Conversion preview</h2><p className="mt-1 text-sm text-muted">Confirming creates a Vendor record. The PBS record remains in the database and is marked converted.</p></div><dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3"><div><dt className="text-muted">PBS code</dt><dd className="font-semibold">{selected.pbsCode}</dd></div><div><dt className="text-muted">Assigned BS code</dt><dd className="font-semibold">{suggestedBsCode}</dd></div><div><dt className="text-muted">Organisation</dt><dd>{selected.vendorName}</dd></div><div><dt className="text-muted">Vendor type</dt><dd>{selected.vendorType ?? "—"}</dd></div><div><dt className="text-muted">Committed discount</dt><dd>{selected.committedDiscount ?? "—"}</dd></div><div><dt className="text-muted">Address</dt><dd>{[selected.address, selected.district, selected.state, selected.pinCode].filter(Boolean).join(", ") || "—"}</dd></div></dl><div className="mt-6"><InlineActionForm action={convertPreBooksellerAction.bind(null, selected.preBooksellerId)}>Confirm BS conversion</InlineActionForm></div></Card> : <Card className="p-8 text-center text-sm text-muted">Select a pending PBS record to review its conversion.</Card>}
  </>;
}
