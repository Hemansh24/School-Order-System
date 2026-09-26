import Link from "next/link";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { getGroupMappingData } from "@/lib/services/groups";
import { confirmGroupMappingAction, syncGroupsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getGroupMappingData(q, page);
  const locationsByGroup = new Map(data.groups.map((group) => [group.groupCode, group.locations]));
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return <>
    <PageHeader title="Grouped Schools" description="Search and review PT-school assignments to GS-code locations." action={<form action={syncGroupsAction}><SubmitButton>Sync Group Sheet</SubmitButton></form>} />
    <Card className="mb-5 p-4"><form className="flex max-w-xl gap-2"><input name="q" defaultValue={q} placeholder="Search a PT code" className="h-10 flex-1 rounded border border-line px-3"/><SubmitButton type="submit">Search</SubmitButton>{q ? <Link href="/groups" className="inline-flex h-10 items-center px-3 text-sm font-semibold text-brand-dark">Clear</Link> : null}</form></Card>
    <Card><div className="border-b border-line p-4 text-sm text-muted">Showing {data.mappings.length} of {data.total} mappings. Each row shows locations only for that school’s GS code.</div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr><th className="px-4 py-3">PT school</th><th className="px-4 py-3">GS code</th><th className="px-4 py-3">Mapped location</th><th className="px-4 py-3">Pincode suggestion</th><th className="px-4 py-3">Review</th></tr></thead><tbody className="divide-y divide-line">{data.mappings.map((mapping) => { const org = data.organisationByPtCode.get(mapping.ptCode); const locations = org?.groupCode ? locationsByGroup.get(org.groupCode) ?? [] : []; return <tr key={mapping.ptCode}><td className="px-4 py-3"><div className="font-medium">{mapping.ptCode}</div><div className="text-xs text-muted">{org?.organisationName ?? "Unknown school"}</div></td><td className="px-4 py-3">{org?.groupCode ?? "—"}</td><td className="px-4 py-3">{mapping.location ? `${mapping.location.schoolGroup.groupCode}-${mapping.location.subCode}` : "Unmapped"}</td><td className="px-4 py-3">{mapping.suggestedLocation ? `${mapping.suggestedLocation.schoolGroup.groupCode}-${mapping.suggestedLocation.subCode}` : "—"}</td><td className="px-4 py-3"><form action={confirmGroupMappingAction} className="flex gap-2"><input type="hidden" name="ptCode" value={mapping.ptCode}/><select name="locationId" defaultValue={mapping.location?.schoolGroupLocationId ?? mapping.suggestedLocation?.schoolGroupLocationId ?? ""} className="h-9 min-w-56 rounded border border-line bg-white px-2"><option value="">Unmapped</option>{locations.map((location) => <option key={location.schoolGroupLocationId} value={location.schoolGroupLocationId}>{location.subCode}: {location.name}</option>)}</select><SubmitButton type="submit" variant="secondary">Confirm</SubmitButton></form></td></tr>; })}</tbody></table></div><div className="flex items-center justify-between border-t border-line p-4 text-sm"><span>Page {data.page} of {totalPages}</span><div className="flex gap-3">{data.page > 1 ? <Link href={`/groups?q=${encodeURIComponent(q)}&page=${data.page - 1}`} className="font-semibold text-brand-dark">Previous</Link> : null}{data.page < totalPages ? <Link href={`/groups?q=${encodeURIComponent(q)}&page=${data.page + 1}`} className="font-semibold text-brand-dark">Next</Link> : null}</div></div></Card>
  </>;
}
