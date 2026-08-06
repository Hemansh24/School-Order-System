import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { deleteSchoolAction, syncImportedOrganisationsAsSchoolsAction } from "@/app/schools/actions";
import { InlineActionForm } from "@/components/inline-action-form";
import { AddSchoolForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { schoolName: "asc" }
  });

  return (
    <>
      <PageHeader
        title="Schools"
        description="Organisation-backed school destinations keyed by PT code, falling back to PR code."
        action={
          <InlineActionForm action={syncImportedOrganisationsAsSchoolsAction}>
            Replace With Organisations
          </InlineActionForm>
        }
      />
      <AddSchoolForm />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Pincode</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {schools.map((school) => (
                <tr key={school.schoolId}>
                  <td className="px-4 py-3 font-semibold text-ink">{school.schoolCode}</td>
                  <td className="px-4 py-3">{school.schoolName}</td>
                  <td className="px-4 py-3 text-muted">{school.address || "Not set"}</td>
                  <td className="px-4 py-3 text-muted">{school.district || "Not set"}</td>
                  <td className="px-4 py-3 text-muted">{school.state || "Not set"}</td>
                  <td className="px-4 py-3 text-muted">{school.pincode || "Not set"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/schools/${school.schoolId}/edit`}
                        className="font-semibold text-brand-dark"
                      >
                        Edit
                      </Link>
                      <InlineActionForm
                        action={deleteSchoolAction.bind(null, school.schoolId)}
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
      </Card>
    </>
  );
}
