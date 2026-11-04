/** Orders planned this calendar year are used in the following academic year. */
export function getCurrentSessionYear(now: Date = new Date()): string {
  const year = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric"
  }).format(now));
  return `${year + 1}-${year + 2}`;
}

/** Academic sessions start on April 1 in India. */
export function getAcademicSessionOptions(now: Date = new Date()): [string, string] {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "numeric"
  }).formatToParts(now);
  const year = Number(parts.find(part => part.type === "year")?.value);
  const month = Number(parts.find(part => part.type === "month")?.value);
  const start = month >= 4 ? year : year - 1;
  return [`${start}-${start + 1}`, `${start + 1}-${start + 2}`];
}
