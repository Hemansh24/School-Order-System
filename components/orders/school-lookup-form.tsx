"use client";

import { useActionState } from "react";
import { lookupSchoolAction, type ReferenceActionState } from "@/app/schools/actions";
import { Card, SubmitButton } from "@/components/ui";

const inputClass =
  "focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase text-muted";
const initialState = { ok: false } satisfies ReferenceActionState;

export function SchoolLookupForm() {
  const [state, action] = useActionState<ReferenceActionState, FormData>(
    lookupSchoolAction,
    initialState
  );

  return (
    <Card className="p-5">
      <form action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <h2 className="font-semibold text-ink">Lookup or Create School</h2>
          <p className="mt-1 text-sm text-muted">
            Partial entries show matching schools. A new school is created only when school name, address, district, state, and pincode are all entered and no exact match exists.
          </p>
          {state.message ? (
            <p className={`mt-2 text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>
              {state.message}
            </p>
          ) : null}
        </div>
        <TextField name="schoolName" label="Name" placeholder="Greenwood Public School" />
        <TextField name="address" label="Address" placeholder="Sector 14, Block A" />
        <TextField name="district" label="District" placeholder="Gautam Buddh Nagar" />
        <TextField name="state" label="State" placeholder="Uttar Pradesh" />
        <TextField name="pincode" label="Pincode" placeholder="201301" />
        {state.ok && state.school ? (
          <div className="rounded-md border border-line bg-canvas p-3 md:col-span-2 xl:col-span-3">
            <span className={labelClass}>{state.created ? "New School Code" : "Existing School Code"}</span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <code className="rounded bg-white px-3 py-2 text-sm font-semibold text-ink">
                {state.school.schoolCode}
              </code>
              <CopyCodeButton code={state.school.schoolCode} />
            </div>
          </div>
        ) : null}
        {state.matches?.length ? (
          <div className="overflow-hidden rounded-md border border-line bg-white md:col-span-2 xl:col-span-3">
            <div className="border-b border-line bg-canvas px-3 py-2">
              <h3 className="text-sm font-semibold text-ink">Matched Schools</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-canvas text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Address</th>
                    <th className="px-3 py-2">District</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Pincode</th>
                  </tr>
                </thead>
                <tbody>
                  {state.matches.map((match) => (
                    <tr key={match.schoolId} className="border-t border-line">
                      <td className="px-3 py-2 font-medium text-ink">{match.schoolCode}</td>
                      <td className="px-3 py-2 text-muted">{match.address || "-"}</td>
                      <td className="px-3 py-2 text-muted">{match.district || "-"}</td>
                      <td className="px-3 py-2 text-muted">{match.state || "-"}</td>
                      <td className="px-3 py-2 text-muted">{match.pincode || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <div className="flex items-end">
          <SubmitButton type="submit" className="w-full">
            Lookup School
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function TextField({
  label,
  name,
  required = false,
  placeholder
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  async function copyCode() {
    await navigator.clipboard.writeText(code);
  }

  return (
    <SubmitButton type="button" variant="secondary" onClick={copyCode}>
      Copy Code
    </SubmitButton>
  );
}
