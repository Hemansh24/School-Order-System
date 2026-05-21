import { Card, PageHeader } from "@/components/ui";
import { AddSchoolForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({ orderBy: { schoolName: "asc" } });

  return (
    <>
      <PageHeader title="Schools" description="Destination schools for shipping and vendor links." />
      <AddSchoolForm />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {schools.map((school) => (
                <tr key={school.schoolId}>
                  <td className="px-4 py-3 font-semibold text-ink">{school.schoolCode}</td>
                  <td className="px-4 py-3">{school.schoolName}</td>
                  <td className="px-4 py-3 text-muted">{school.contactPerson}</td>
                  <td className="px-4 py-3 text-muted">{school.phone}</td>
                  <td className="px-4 py-3 text-muted">{school.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
