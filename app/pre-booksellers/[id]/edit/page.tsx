import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { updatePreBooksellerAction } from "../../actions";

export const dynamic = "force-dynamic";

const fields = [
  ["pbsCode", "PBS Code", true], ["sourceBsCode", "Source BS Code"], ["vendorName", "Organisation Name", true],
  ["district", "District"], ["state", "State"], ["pinCode", "Pin Code"], ["contactPerson", "Contact"], ["email", "Email"],
  ["taxId", "GST / PAN / TAN"], ["schoolDealCount", "No. of School Deals"], ["approximateStrength", "Approx. Strength"],
  ["groupSchoolCount", "No. of Group Schools"], ["committedDiscount", "Committed Discount"],
  ["transportCollaboration", "Transport Collaboration"], ["bookingStation", "Booking Station"],
  ["vendorType", "Vendor Type"], ["paymentStatus", "Payment Status"]
] as const;

export default async function EditPreBooksellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.preBookseller.findUnique({ where: { preBooksellerId: Number(id) } });
  if (!record) notFound();
  const action = updatePreBooksellerAction.bind(null, record.preBooksellerId);
  return <>
    <PageHeader title={`Edit ${record.pbsCode}`} description="Update PBS source details. Conversion status and assigned BS code remain protected." action={<Link href="/pre-booksellers" className="font-semibold text-brand-dark">Back to PBS data</Link>} />
    <Card className="p-5"><form action={action} className="grid gap-4 md:grid-cols-2">{fields.map(([name, label, required]) => <label key={name} className="text-sm font-medium text-ink">{label}<input name={name} required={required} defaultValue={record[name] ?? ""} className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal" /></label>)}<label className="text-sm font-medium text-ink md:col-span-2">Address<textarea name="address" defaultValue={record.address ?? ""} className="mt-1 min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 font-normal" /></label><div className="md:col-span-2"><SubmitButton type="submit">Save PBS record</SubmitButton></div></form></Card>
  </>;
}
