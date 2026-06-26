import Link from "next/link";
import { Search } from "lucide-react";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/ui";
import { getOrganisationLookupData } from "@/lib/services/organisations";

export const dynamic = "force-dynamic";

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";

export default async function OrganisationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const paramsObject = await searchParams;
  const params = toUrlSearchParams(paramsObject);
  const data = await getOrganisationLookupData(params);

  return (
    <>
      <PageHeader
        title="Organisation Lookup"
        description="Search, filter, and inspect organisation records synced into Cloud SQL PostgreSQL."
      />

      <Card className="mb-6 p-4">
        <form action="/organisations" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TextInput
            name="prCode"
            label="PR Code"
            defaultValue={data.filters.prCode}
            placeholder="PR000123"
          />
          <TextInput
            name="organisationName"
            label="Organisation Name"
            defaultValue={data.filters.organisationName}
            placeholder="Greenwood Public School"
          />
          <TextInput
            name="district"
            label="District"
            defaultValue={data.filters.district}
            placeholder="Gautam Buddh Nagar"
          />
          <TextInput
            name="state"
            label="State"
            defaultValue={data.filters.state}
            placeholder="Uttar Pradesh"
          />
          <TextInput
            name="actionStatus"
            label="Action Status"
            defaultValue={data.filters.actionStatus}
            placeholder="Active"
          />
          <SelectInput
            name="workingStatus"
            label="Working Status"
            defaultValue={data.filters.workingStatus}
          >
            <option value="">All</option>
            <option value="working">Working</option>
            <option value="not_working">Not working</option>
            <option value="unknown">Not set</option>
          </SelectInput>
          <div className="flex items-end">
            <SubmitButton type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search
            </SubmitButton>
          </div>
          <div className="flex items-end">
            <Link
              href="/organisations"
              className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-brand-soft"
            >
              Clear
            </Link>
          </div>
        </form>
      </Card>

      {data.selectedOrganisation ? (
        <Card className="mb-6">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-semibold text-ink">Organisation Details</h2>
            <p className="text-sm text-muted">
              Full record for {data.selectedOrganisation.organisationName}.
            </p>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailField label="PR Code" value={data.selectedOrganisation.prCode} />
            <DetailField label="Group Code" value={data.selectedOrganisation.groupCode} />
            <DetailField label="PT Code" value={data.selectedOrganisation.ptCode} />
            <DetailField
              label="Organisation Name"
              value={data.selectedOrganisation.organisationName}
            />
            <DetailField label="Address" value={data.selectedOrganisation.address} />
            <DetailField label="District" value={data.selectedOrganisation.district} />
            <DetailField label="State" value={data.selectedOrganisation.state} />
            <DetailField label="Pin Code" value={data.selectedOrganisation.pinCode} />
            <DetailField label="Phone" value={data.selectedOrganisation.phone} />
            <DetailField
              label="Email"
              value={formatContactValue(data.selectedOrganisation.email, "email")}
            />
            <DetailField
              label="Website"
              value={formatContactValue(data.selectedOrganisation.website, "website")}
            />
            <DetailField label="Action Status" value={data.selectedOrganisation.actionStatus} />
            <DetailField label="Remark" value={data.selectedOrganisation.remark} />
            <DetailField label="Academic Year" value={data.selectedOrganisation.academicYear} />
            <DetailField
              label="Strength"
              value={
                data.selectedOrganisation.strength === null
                  ? null
                  : String(data.selectedOrganisation.strength)
              }
            />
            <DetailField label="Board Type" value={data.selectedOrganisation.boardType} />
            <DetailField
              label="Session Start From"
              value={formatDate(data.selectedOrganisation.sessionStartFrom)}
            />
            <DetailField label="Minority Type" value={data.selectedOrganisation.minorityType} />
            <DetailField label="Saturday Status" value={data.selectedOrganisation.saturdayStatus} />
            <DetailField
              label="Working Status"
              value={formatWorkingStatus(data.selectedOrganisation.workingStatus)}
            />
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-semibold text-ink">Results</h2>
          <p className="text-sm text-muted">
            {data.totalCount === 0
              ? "No organisation records match the current filters."
              : `Showing ${data.resultStart}-${data.resultEnd} of ${data.totalCount} organisations.`}
          </p>
          {data.usedFallbackSearch ? (
            <p className="mt-1 text-xs text-muted">
              Using the currently deployed SQL Connect list operation. Deploy the updated connector to
              enable full server-side search for all records.
            </p>
          ) : null}
        </div>

        {data.organisations.length === 0 ? (
          <div className="p-4">
            <EmptyState>
              Adjust the filters and try again, or clear the search to browse all organisations.
            </EmptyState>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-left text-sm">
                <thead className="bg-canvas text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">PR Code</th>
                    <th className="px-4 py-3">Organisation Name</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Pin Code</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Website</th>
                    <th className="px-4 py-3">Action Status</th>
                    <th className="px-4 py-3">Working Status</th>
                    <th className="px-4 py-3">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.organisations.map((organisation) => (
                    <tr key={organisation.prCode}>
                      <td className="px-4 py-3 font-semibold text-ink">{organisation.prCode}</td>
                      <td className="px-4 py-3">{organisation.organisationName}</td>
                      <td className="px-4 py-3 text-muted">{displayValue(organisation.district)}</td>
                      <td className="px-4 py-3 text-muted">{displayValue(organisation.state)}</td>
                      <td className="px-4 py-3 text-muted">{displayValue(organisation.pinCode)}</td>
                      <td className="px-4 py-3 text-muted">{displayValue(organisation.phone)}</td>
                      <td className="px-4 py-3 text-muted">{displayValue(organisation.email)}</td>
                      <td className="px-4 py-3 text-muted">
                        <ContactValue value={organisation.website} type="website" />
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {displayValue(organisation.actionStatus)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatWorkingStatus(organisation.workingStatus)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={buildOrganisationHref(params, organisation.prCode)}
                          className="font-semibold text-brand-dark"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 ? (
              <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Page {data.page} of {data.totalPages}
                </p>
                <div className="flex gap-3">
                  {data.page > 1 ? (
                    <PaginationLink href={buildPageHref(params, data.page - 1)}>
                      Previous
                    </PaginationLink>
                  ) : (
                    <DisabledPaginationLabel>Previous</DisabledPaginationLabel>
                  )}
                  {data.page < data.totalPages ? (
                    <PaginationLink href={buildPageHref(params, data.page + 1)}>
                      Next
                    </PaginationLink>
                  ) : (
                    <DisabledPaginationLabel>Next</DisabledPaginationLabel>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>
    </>
  );
}

function toUrlSearchParams(source: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  });

  return params;
}

function buildOrganisationHref(params: URLSearchParams, prCode: string) {
  const nextParams = new URLSearchParams(params);
  nextParams.set("selected", prCode);

  return `/organisations?${nextParams.toString()}`;
}

function buildPageHref(params: URLSearchParams, page: number) {
  const nextParams = new URLSearchParams(params);
  nextParams.set("page", String(page));

  return `/organisations?${nextParams.toString()}`;
}

function displayValue(value: string | null | undefined) {
  return value?.trim() ? value : "Not set";
}

function formatWorkingStatus(value: boolean | null | undefined) {
  if (value === true) {
    return "Working";
  }

  if (value === false) {
    return "Not working";
  }

  return "Not set";
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(value));
}

function formatContactValue(
  value: string | null,
  type: "email" | "website"
): React.ReactNode | null {
  if (!value?.trim()) {
    return null;
  }

  if (type === "email") {
    return <a href={`mailto:${value}`}>{value}</a>;
  }

  const href = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {value}
    </a>
  );
}

function TextInput({
  label,
  name,
  defaultValue,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  defaultValue,
  children
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

function DetailField({
  label,
  value
}: {
  label: string;
  value: React.ReactNode | null;
}) {
  return (
    <div className="rounded-md border border-line bg-canvas p-3">
      <p className={labelClass}>{label}</p>
      <div className="text-sm text-ink">{value ?? "Not set"}</div>
    </div>
  );
}

function ContactValue({
  value,
  type
}: {
  value: string | null;
  type: "email" | "website";
}) {
  const formatted = formatContactValue(value, type);

  if (!formatted) {
    return "Not set";
  }

  return <span className="break-all text-brand-dark">{formatted}</span>;
}

function PaginationLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-brand-soft"
    >
      {children}
    </Link>
  );
}

function DisabledPaginationLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-canvas px-4 text-sm font-semibold text-muted">
      {children}
    </span>
  );
}
