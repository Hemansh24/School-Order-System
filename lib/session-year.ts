/** Orders planned this calendar year are used in the following academic year. */
export function getCurrentSessionYear(now: Date = new Date()): string {
  const year = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric"
  }).format(now));
  return `${year + 1}-${year + 2}`;
}
