import Link from "next/link";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { getChristianGroupData, getGsMasterData } from "@/lib/services/groups";
import { syncGsAction, syncChristianAction } from "./actions";
import { formatSchoolAddress } from "@/lib/shipping";

export const dynamic = "force-dynamic";
const cell = "px-4 py-3";
const text = (value: unknown) => typeof value === "string" && value.trim() ? value : "—";

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; cq?: string; cp?: string; message?: string; error?: string }> }) {
  const params = await searchParams;
  const q = params.q ?? "", cq = params.cq ?? "";
  const [data, christian] = await Promise.all([getGsMasterData(q, Number(params.page) || 1), getChristianGroupData(cq, Math.max(1, Number(params.cp) || 1))]);
  return <>
    <PageHeader title="Grouped Schools" description="Group master data and organisation membership stored in local PostgreSQL." />
    {params.message ? <Card className="mb-4 p-4 text-sm">{params.message}</Card> : null}
    {params.error ? <Card className="mb-4 p-4 text-sm text-danger">{params.error}</Card> : null}
    <Card className="mb-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">GS Groups · {data.total}</h2><form action={syncGsAction}><SubmitButton>Refresh GS from Google Sheet</SubmitButton></form></div>
      <form className="mt-4 flex flex-wrap gap-2"><input name="q" defaultValue={q} placeholder="GS code, group name, PT/PR code, school, district or state" className="h-10 min-w-64 flex-1 rounded border border-line px-3"/><input type="hidden" name="cq" value={cq}/><SubmitButton type="submit">Search</SubmitButton><Link href="/groups" className="p-2 text-sm text-brand-dark">Clear</Link></form>
      <p className="mt-3 text-sm text-muted">Membership comes from Organisation.groupCode. Schools without a group remain independent.</p>
    </Card>
    {data.groups.map(group => <Card key={group.schoolGroupId} className="mb-4">
      <div className="border-b border-line p-4"><h3 className="font-semibold">{group.groupCode} — {group.groupName}</h3><p className="text-sm text-muted">{group.members.length} linked organisations · {group.locations.length} group addresses</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["Location", "Address", "Runs multiple schools", "Sheet school count", "Implemented", "Centralized decision"].map(label => <th key={label} className={cell}>{label}</th>)}</tr></thead><tbody>{group.locations.map(location => {
        const sourceRows = (group.metadata as { sourceRows?: { subCode: string; rawValues: string[] }[] } | null)?.sourceRows;
        const raw = sourceRows?.find(row => row.subCode === location.subCode)?.rawValues;
        return <tr key={location.schoolGroupLocationId} className="border-t border-line"><td className={cell}>{location.subCode}<div>{location.name}</div></td><td className={cell}><div className="max-w-md whitespace-pre-line">{formatSchoolAddress(location) || "Address unavailable"}</div></td><td className={cell}>{text(raw?.[3])}</td><td className={cell}>{text(raw?.[5])}</td><td className={cell}>{text(raw?.[6])}</td><td className={cell}>{text(location.centralizedDecision)}</td></tr>;
      })}</tbody></table></div>
      <details className="border-t border-line p-4"><summary className="cursor-pointer font-medium">Member organisations ({group.members.length})</summary>{group.members.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr>{["PR code", "PT code", "Organisation", "Location"].map(label => <th key={label} className={cell}>{label}</th>)}</tr></thead><tbody>{group.members.map(member => <tr key={member.prCode} className="border-t border-line"><td className={cell}>{member.prCode}</td><td className={cell}>{member.ptCode ?? "PR only"}</td><td className={cell}>{member.organisationName}</td><td className={cell}>{[member.district, member.state, member.pinCode].filter(Boolean).join(", ") || "—"}</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-muted">No organisations are linked to this GS code.</p>}</details>
    </Card>)}
    {!data.groups.length ? <Card className="mb-4 p-4">No matching GS groups.</Card> : null}
    <Pager page={data.page} total={data.total} pageSize={data.pageSize} href={page => `/groups?q=${encodeURIComponent(q)}&page=${page}&cq=${encodeURIComponent(cq)}&cp=${christian.page}`}/>
    {data.unresolved.length ? <Card className="my-5 p-4"><h2 className="font-semibold">Unresolved GS relationships</h2><div className="mt-3 max-h-80 overflow-auto">{data.unresolved.map(member => <p key={member.prCode} className="py-1 text-sm">{member.groupCode} · {member.prCode} · {member.ptCode ?? "PR only"} · {member.organisationName}</p>)}</div></Card> : null}
    <Card className="mt-6">
      <div className="border-b border-line p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Christian Groups · {christian.total}</h2><form action={syncChristianAction}><SubmitButton>Sync Christian Groups</SubmitButton></form></div><form className="mt-4 flex gap-2"><input name="cq" defaultValue={cq} placeholder="C1 code, organisation, district or state" className="h-10 flex-1 rounded border border-line px-3"/><input type="hidden" name="q" value={q}/><input type="hidden" name="page" value={data.page}/><SubmitButton type="submit">Search</SubmitButton></form></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-canvas text-xs uppercase text-muted"><tr>{["C1 code", "Organisation", "Denomination / category", "Coverage", "Location", "Schools", "Contact"].map(label => <th key={label} className={cell}>{label}</th>)}</tr></thead><tbody>{christian.groups.map(group => <tr key={group.groupCode} className="border-t border-line"><td className={cell}>{group.groupCode}</td><td className={cell}>{group.groupName}<div className="whitespace-pre-line text-xs">{group.website}</div></td><td className={cell}>{group.religionDenomination ?? "—"}<div className="text-xs">{group.category ?? "—"}</div></td><td className={cell}>{group.geographyType ?? "—"}<div className="text-xs">{group.operationalAreas ?? "—"}</div></td><td className={cell}>{[group.district, group.state, group.pincode].filter(Boolean).join(", ")}<div className="max-w-64 whitespace-pre-line text-xs">{group.address}</div></td><td className={cell}>Runs: {group.runsSchools ?? "—"}<div>Schools: {group.totalSchools ?? "—"}</div><div>Students: {group.totalStudents ?? "—"}</div><div>Centralized: {group.centralizedDecision ?? "—"}</div></td><td className={cell}>{group.phoneEmail ?? "—"}</td></tr>)}</tbody></table></div>
    </Card>
    <Pager page={christian.page} total={christian.total} pageSize={christian.pageSize} href={page => `/groups?q=${encodeURIComponent(q)}&page=${data.page}&cq=${encodeURIComponent(cq)}&cp=${page}`}/>
  </>;
}
function Pager({ page, total, pageSize, href }: { page: number; total: number; pageSize: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="my-4 flex justify-between text-sm"><span>Page {page} of {pages}</span><div className="flex gap-4">{page > 1 ? <Link href={href(page - 1)}>Previous</Link> : null}{page < pages ? <Link href={href(page + 1)}>Next</Link> : null}</div></div>;
}
