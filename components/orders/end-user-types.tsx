import { Card } from "@/components/ui";
import { sessionStartYear, type EndUser, type EndUserClassification } from "@/lib/end-user-type";

const labels = { new: "New", old: "Old", gap: "Gap" };
const colors = { new: "bg-emerald-50 text-emerald-800", old: "bg-blue-50 text-blue-800", gap: "bg-amber-50 text-amber-800" };

export function EndUserTypes({ schools, sessionYear, types, loading, error, retry }: {
  schools: EndUser[];
  sessionYear: string;
  types?: Record<string, EndUserClassification>;
  loading?: boolean;
  error?: string;
  retry?: () => void;
}) {
  if (!schools.length) return null;
  const validSession = sessionStartYear(sessionYear) !== null;
  return <Card className="my-4 p-5">
    <h2 className="text-lg font-semibold text-ink">Type of End User</h2>
    <p className="mt-1 text-sm text-muted">{validSession ? `For session ${sessionYear}. New: first session; Old: used last session; Gap: returning after a break.` : "Enter a valid session year to classify end users."}</p>
    {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}{retry ? <button type="button" onClick={retry} className="focus-ring ml-2 underline">Retry</button> : null}</p> : null}
    <div className="mt-3 overflow-x-auto" aria-live="polite" aria-busy={loading}>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-muted"><tr><th className="py-2 pr-4">PT Code</th><th className="py-2 pr-4">School</th><th className="py-2">Type of End User</th></tr></thead>
        <tbody className="divide-y divide-line">{schools.map(school => {
          const value = types?.[school.schoolCode];
          const type = value?.type;
          return <tr key={school.schoolCode}>
            <td className="py-3 pr-4 font-medium">{value?.ptCode ?? school.schoolCode}{!value?.ptCode && /^PR/i.test(school.schoolCode) ? <span className="block text-xs font-normal text-muted">PT assigned on conversion</span> : null}</td>
            <td className="py-3 pr-4">{school.schoolName}</td>
            <td className="py-3">{!validSession ? "Session required" : error ? "Unavailable" : loading ? "Loading…" : type ? <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${colors[type]}`}>{labels[type]}</span> : "Unavailable"}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </Card>;
}
