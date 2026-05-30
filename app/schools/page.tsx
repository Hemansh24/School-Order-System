import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { deleteSchoolAction } from "@/app/schools/actions";
import { AddSchoolForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";
import { nextSchoolCode } from "@/lib/reference-codes";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const [schools, schoolCode] = await Promise.all([
    prisma.school.findMany({
      orderBy: { schoolName: "asc" },
      include: { schoolBranches: { orderBy: { branchName: "asc" } } }
    }),
    nextSchoolCode()
  ]);

  return (
    <>
      <PageHeader title="Schools" description="Destination schools for shipping and vendor links." />
      <AddSchoolForm
        nextCode={schoolCode}
        schools={schools.map((school) => ({
          schoolId: school.schoolId,
          schoolCode: school.schoolCode,
          schoolName: school.schoolName
        }))}
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Branches</th>
                <th className="px-4 py-3">Addresses</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {schools.map((school) => (
                <tr key={school.schoolId}>
                  <td className="px-4 py-3 font-semibold text-ink">{school.schoolCode}</td>
                  <td className="px-4 py-3">{school.schoolName}</td>
                  <td className="px-4 py-3 text-muted">{school.schoolBranches.length}</td>
                  <td className="px-4 py-3 text-muted">
                    {school.schoolBranches.length > 0
                      ? school.schoolBranches
                          .map((branch) => `${branch.branchName}${branch.address ? ` - ${branch.address}` : ""}`)
                          .join(", ")
                      : "No branches yet"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/schools/${school.schoolId}/edit`}
                        className="font-semibold text-brand-dark"
                      >
                        Edit
                      </Link>
                      <form action={deleteSchoolAction.bind(null, school.schoolId)}>
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
